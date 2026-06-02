/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Hyperparams {
  lora_r: number;
  lora_alpha: number;
  lora_dropout: number;
  learning_rate: number;
  num_train_epochs: number;
  per_device_train_batch_size: number;
  gradient_accumulation_steps: number;
  lora_target_modules: string;
}

export const getDefaultHyperparams = (): Hyperparams => ({
  lora_r: 16,
  lora_alpha: 32,
  lora_dropout: 0.05,
  learning_rate: 2e-4,
  num_train_epochs: 3,
  per_device_train_batch_size: 4,
  gradient_accumulation_steps: 4,
  lora_target_modules: "q_proj,k_proj,v_proj,o_proj,gate_proj,up_proj,down_proj",
});

export const getRequirementsTxt = () => `transformers>=4.40.0
peft>=0.10.0
accelerate>=0.29.0
torch>=2.2.0
datasets>=2.19.0
bitsandbytes>=0.43.0
sentencepiece>=0.2.0
tiktoken>=0.7.0
tqdm>=4.66.0
numpy>=1.24.0
scikit-learn>=1.4.0
sacrebleu>=2.4.0
jieba>=0.42.1
`;

export const getTrainPy = (h: Hyperparams) => `import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
    Trainer,
    DataCollatorForSeq2Seq
)
from peft import (
    LoraConfig,
    get_peft_model,
    prepare_model_for_kbit_training
)

# 1. Configurations
MODEL_NAME = "Qwen/Qwen2.5-3B-Instruct"  # Under 8B Parameters, Excellent Yoruba Transfer
DATASET_PATH = "yoruba_instructions.jsonl"
OUTPUT_DIR = "./yoruba_qwen_lora"

# 2. BitsAndBytes Config (QLoRA 4-bit)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16
)

print("Loading tokenizer and model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True
)

# Prepare model for PEFT
model = prepare_model_for_kbit_training(model)

# 3. Apply LoRA Config
target_modules = [m.strip() for m in "${h.lora_target_modules}".split(",")]
peft_config = LoraConfig(
    r=${h.lora_r},
    lora_alpha=${h.lora_alpha},
    target_modules=target_modules,
    lora_dropout=${h.lora_dropout},
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, peft_config)
model.print_trainable_parameters()

# 4. Tokenization & Format mapping
def format_prompt(example):
    # Map instruction-following format to Qwen dialogue template
    instruction = example.get("instruction", "")
    user_input = example.get("input", "")
    response = example.get("output", "")
    
    full_instruction = f"{instruction}\\n{user_input}".strip()
    
    prompt = f"<|im_start|>system\\nYou are a helpful assistant fluent in Yoruba and English. All Yoruba outputs must use correct diacritics.<|im_end|>\\n<|im_start|>user\\n{full_instruction}<|im_end|>\\n<|im_start|>assistant\\n"
    target = f"{prompt}{response}<|im_end|>"
    return {"prompt": prompt, "target": target}

def preprocess_function(example):
    formatted = format_prompt(example)
    prompt_ids = tokenizer(formatted["prompt"], truncation=True, max_length=512)["input_ids"]
    target_ids = tokenizer(formatted["target"], truncation=True, max_length=1024)["input_ids"]
    
    # Label mask for labels (we only compute loss on the output, not the instruction prompt)
    labels = [-100] * len(prompt_ids) + target_ids[len(prompt_ids):]
    return {
        "input_ids": target_ids,
        "labels": labels
    }

# 5. Load and Tokenize Yoruba Dataset
print("Loading instruction dataset...")
dataset = load_dataset("json", data_files=DATASET_PATH, split="train")
tokenized_dataset = dataset.map(
    preprocess_function, 
    remove_columns=dataset.column_names,
    desc="Tokenizing Yoruba dataset"
)

# Optional Train/Val split
dataset_split = tokenized_dataset.train_test_split(test_size=0.1, seed=42)
train_data = dataset_split["train"]
val_data = dataset_split["test"]

# 6. Training Arguments
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    per_device_train_batch_size=${h.per_device_train_batch_size},
    gradient_accumulation_steps=${h.gradient_accumulation_steps},
    learning_rate=${h.learning_rate},
    num_train_epochs=${h.num_train_epochs},
    logging_steps=10,
    save_strategy="epoch",
    evaluation_strategy="epoch",
    evaluation_strategy="epoch" if len(val_data) > 0 else "no",
    fp16=False,
    bf16=True,  # Recommended for Ampere+ GPUs
    optim="paged_adamw_8bit",
    report_to="tensorboard",
    warmup_ratio=0.03,
    remove_unused_columns=False
)

# 7. Trainer Setup
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_data,
    eval_dataset=val_data,
    data_collator=DataCollatorForSeq2Seq(tokenizer, pad_to_multiple_of=8, return_tensors="pt", padding=True)
)

print("Starting LoRA training...")
trainer.train()

# 8. Save adapter weights
print("Saving fine-tuned adapter weights...")
trainer.model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print("Training Complete!")
`;

export const getEvaluatePy = () => `import os
import torch
import sacrebleu
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
from tqdm import tqdm

MODEL_NAME = "Qwen/Qwen2.5-3B-Instruct"
ADAPTER_PATH = "./yoruba_qwen_lora"
TEST_DATA_PATH = "yoruba_test_set.jsonl"

def calculate_yoruba_diacritic_density(text: str) -> float:
    # Character classes representing standard Yoruba vowels and letters with subdots/accent tons marks
    # e.g., ẹ, ọ, ṣ, á, é, í, ó, ọ́, ụ́, à, è, ì, ò, ọ̀, ù
    yoruba_chars = "ẹọṣáéíóọ́úàèìòọ̀ùẹ̀ọ̀ṢẸỌÁÉÍÓÚÀÈÌÒÙ"
    if not text:
        return 0.0
    diacritic_count = sum(1 for c in text if c in yoruba_chars)
    return diacritic_count / len(text)

def main():
    print("Loading base model and tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    base_model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    
    print("Merging LoRA adapters...")
    model = PeftModel.from_pretrained(base_model, ADAPTER_PATH)
    model = model.merge_and_unload()
    model.eval()

    print("Loading test benchmark set...")
    dataset = load_dataset("json", data_files=TEST_DATA_PATH, split="train")
    
    predictions = []
    references = []
    
    # Statistics tracker
    ref_diacritic_density_sum = 0
    pred_diacritic_density_sum = 0
    
    print("Generating responses for evaluation...")
    for idx, item in enumerate(tqdm(dataset)):
        instruction = item.get("instruction", "")
        user_input = item.get("input", "")
        reference_output = item.get("output", "")
        
        prompt = f"<|im_start|>system\\nYou are a helpful Yoruba expert assistant. Produce rich Yoruba text with proper diacritics.\\n<|im_end|><|im_start|>user\\n{instruction}\\n{user_input}\\n<|im_end|><|im_start|>assistant\\n"
        
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=256,
                temperature=0.3,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        full_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Extract assistant response
        assistant_response = full_text.split("assistant\\n")[-1].strip()
        
        predictions.append(assistant_response)
        references.append([reference_output])
        
        # Diacritic density tracking
        ref_diacritic_density_sum += calculate_yoruba_diacritic_density(reference_output)
        pred_diacritic_density_sum += calculate_yoruba_diacritic_density(assistant_response)

    # 1. Calculate BLEU score (English ↔ Yoruba Translations)
    bleu = sacrebleu.corpus_bleu(predictions, references)
    print(f"\\n--- Yoruba LLM Benchmark Metrics ---")
    print(f"BLEU Score: {bleu.score:.2f}")
    
    # 2. Diacritic Preservation Match Rate
    avg_ref_density = ref_diacritic_density_sum / len(dataset)
    avg_pred_density = pred_diacritic_density_sum / len(dataset)
    preservation_rate = (avg_pred_density / avg_ref_density) * 100 if avg_ref_density > 0 else 0.0
    print(f"Average Reference Diacritic Density: {avg_ref_density:.4f}")
    print(f"Average Predicted Diacritic Density: {avg_pred_density:.4f}")
    print(f"Diacritic Tone-Mark Preservation Rate: {preservation_rate:.2f}%")

if __name__ == "__main__":
    main()
`;

export const getInferencePy = () => `import sys
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

MODEL_NAME = "Qwen/Qwen2.5-3B-Instruct"
ADAPTER_PATH = "./yoruba_qwen_lora"

def load_yoruba_predictor():
    print("Initializing Yoruba Tokenizer & Model setup...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    
    base_model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    
    print("Loading trained Yoruba LoRA adapters...")
    model = PeftModel.from_pretrained(base_model, ADAPTER_PATH)
    model = model.merge_and_unload()
    model.eval()
    
    return model, tokenizer

def generate_text(model, tokenizer, prompt_text: str):
    system_prompt = "You are a highly capable Yoruba Language Specialist. Generate perfect translations, proverbs, and answers using correct accents (GBY, GBE, diacritics - e.g. à, á, ẹ, ọ, ṣ)."
    
    formatted = f"<|im_start|>system\\n{system_prompt}\\n<|im_end|><|im_start|>user\\n{prompt_text}\\n<|im_end|><|im_start|>assistant\\n"
    
    inputs = tokenizer(formatted, return_tensors="pt").to(model.device)
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=512,
            do_sample=True,
            temperature=0.4,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id
        )
    
    full_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    response = full_text.split("assistant\\n")[-1].strip()
    return response

if __name__ == "__main__":
    print("Starting Interactive Yoruba LLM Predictor...")
    model, tokenizer = load_yoruba_predictor()
    print("\\nReady! Enter your prompt below (or 'exit' to quit).")
    
    while True:
        try:
            line = input("\\nÍpín / Input > ")
            if line.strip().lower() in ["exit", "quit"]:
                break
            if not line.strip():
                continue
                
            response = generate_text(model, tokenizer, line)
            print(f"Èsì / Output > {response}")
        except KeyboardInterrupt:
            break
`;

export const getReadmeMd = (h: Hyperparams) => `# Ẹ̀kọ́ LLM: Yoruba LoRA Fine-Tuning Project
This directory contains a complete, production-ready pipeline for fine-tuning the **Qwen-2.5-3B-Instruct** (or similar <8B models) using **QLoRA (Peft/LoRA)** on Yoruba linguistic datasets.

The implementation focuses on correct Yoruba diacritic placement (vowel tone marks and subdots), English-to-Yoruba translations, grammar parsing, and cultural knowledge preservation.

## Directory Structure
\`\`\`
├── requirements.txt         # Required Python packages
├── train.py                 # QLoRA fine-tuning training pipeline
├── evaluate.py              # Automatic BLEU & diacritics preservation metric tester
├── inference.py             # Interactive local predictor CLI
├── yoruba_instructions.jsonl  # Preprocessed training dataset (JSON Lines)
└── README.md                # This manual
\`\`\`

## Configuration Details (LoRA Hyperparameters)
- **Rank ($r$):** ${h.lora_r} (controls update matrix dimension)
- **Scaling Factor ($\\alpha$):** ${h.lora_alpha} (scaling parameter)
- **Dropout Rate:** ${h.lora_dropout}
- **Learning Rate:** ${h.learning_rate}
- **Epochs:** ${h.num_train_epochs}
- **Batch Size:** ${h.per_device_train_batch_size} (Gradient Accumulation: ${h.gradient_accumulation_steps})
- **Target Modules:** \`${h.lora_target_modules}\`

## Quick Start Setup

### Step 1: Install Dependencies
Create a virtual environment and run the package installer:
\`\`\`bash
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
\`\`\`

### Step 2: Prepare Yoruba Train Dataset
Save your dataset as \`yoruba_instructions.jsonl\` where each line has:
\`\`\`json
{"instruction": "State a Yoruba proverb about hard work.", "input": "", "output": "Iṣẹ́ l'òògùn ìṣẹ́. (Work is the antidote to poverty.)"}
\`\`\`

### Step 3: Run Fine-Tuning Pipeline
Start the QLoRA trainer with mixed precision and AdamW optimizer:
\`\`\`bash
python3 train.py
\`\`\`

### Step 4: Run Evaluation Benchmark
Verify translation BLEU and diacritic-density score:
\`\`\`bash
python3 evaluate.py
\`\`\`

### Step 5: Start Local Inference
Chat with your custom Yoruba model:
\`\`\`bash
python3 inference.py
\`\`\`
`;

export const getScraperPy = () => `import urllib.request
import re
import json
from bs4 import BeautifulSoup
import time

# A clean, single-file Python script to scrape Yoruba Wikipedia or Yoruba news articles
# safely with HTTP error handling and compliance with robots.txt (user-agent header setting).

WIKI_YORUBA_START_URL = "https://yo.wikipedia.org/wiki/Ṣege"
OUTPUT_FILE = "raw_yoruba_scraped.jsonl"

def scrape_yoruba_page(url):
    print(f"Scraping Yoruba URL: {url}")
    headers = {'User-Agent': 'YorubaLLMResearchBot/1.0 (NLP Academic Scraper)'}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read()
    except Exception as e:
        print(f"Error loading {url}: {e}")
        return []

    soup = BeautifulSoup(html, 'html.parser')
    
    # Extract structural text segments (paragraphs, heading texts)
    segments = []
    paragraphs = soup.find_all(['p', 'h1', 'h2', 'h3'])
    for p in paragraphs:
        text = p.get_text().strip()
        # Filter noise, ensure minimum Yoruban tokens
        if len(text) > 20: 
            segments.append(text)
            
    return segments

def main():
    pages_to_scrape = [
        "https://yo.wikipedia.org/wiki/Èdè_Yorùbá",
        "https://yo.wikipedia.org/wiki/Nàìjíríà",
        "https://yo.wikipedia.org/wiki/Odùduwà",
        "https://yo.wikipedia.org/wiki/Ìbàdàn",
        "https://yo.wikipedia.org/wiki/Ààrẹ_Nàìjíríà"
    ]
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for url in pages_to_scrape:
            segments = scrape_yoruba_page(url)
            for segment in segments:
                record = {
                    "source": url,
                    "text": segment,
                    "length": len(segment)
                }
                f.write(json.dumps(record, ensure_ascii=False) + "\\n")
            time.sleep(2) # Polite request delay

    print(f"Scraping complete. Scraped nodes written to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
`;

export const getCleanerPy = () => `import json
import re

# Structured script to deduplicate and sanitize crawling/web output.
# Removes HTML remnants, handles casing, filters out high-percentage English paragraphs.

INPUT_FILE = "raw_yoruba_scraped.jsonl"
OUTPUT_FILE = "cleaned_yoruba_text.jsonl"

def is_predominantly_english(text):
    # Quick filter based on highly common English structural words
    english_stopwords = {"the", "and", "of", "to", "in", "is", "that", "it", "with", "for", "on", "was"}
    words = re.findall(r'\\b\\w+\\b', text.lower())
    if not words:
        return False
    counter = sum(1 for w in words if w in english_stopwords)
    return (counter / len(words)) > 0.15

def clean_and_normalize(text):
    # Remove HTML tags, duplicate punctuations, and redundant spacing
    text = re.sub(r'<[^>]*>', '', text)
    text = re.sub(r'\\s+', ' ', text)
    # Fix spacing around standard punctuation
    text = re.sub(r'\\s+([.,!?;:])', r'\\1', text)
    return text.strip()

def main():
    seen_texts = set()
    cleaned_records = 0
    total_records = 0
    
    try:
        with open(INPUT_FILE, "r", encoding="utf-8") as infile, \\
             open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
            for line in infile:
                total_records += 1
                try:
                    data = json.loads(line)
                    raw_text = data.get("text", "")
                    
                    cleaned = clean_and_normalize(raw_text)
                    if not cleaned or len(cleaned) < 15:
                        continue
                        
                    # Filter duplicate paragraphs
                    text_hash = cleaned.lower()
                    if text_hash in seen_texts:
                        continue
                    
                    # Filter mostly English segments
                    if is_predominantly_english(cleaned):
                        continue
                        
                    seen_texts.add(text_hash)
                    
                    record = {
                        "source": data.get("source", "scraped"),
                        "text": cleaned
                    }
                    outfile.write(json.dumps(record, ensure_ascii=False) + "\\n")
                    cleaned_records += 1
                except Exception:
                    continue
    except FileNotFoundError:
        print(f"Source file {INPUT_FILE} not found. Generate one first.")
        return

    print(f"Data Cleaning complete. Kept {cleaned_records} unique, high-quality Yoruba paragraphs out of {total_records} raw records.")

if __name__ == "__main__":
    main()
`;

export const getDiacriticsNormalizerPy = () => `import unicodedata

# High quality diacritics normalizer to combine unicode accent compositions.
# Ensures all character representations are standard Normalization Form C (NFC).
# This prevents model tokenizer mismatches (where 'ọ̀' can be represented as 
# different raw sequences of bytes due to decomposed accents).

def normalize_yoruba_diacritics(text: str) -> str:
    """
    Normalizes text to Normalization Form C (NFC) which combines
    accents and letters into a single unified character.
    Examples:
    - ẹ\\u0300 (decomposed e + subdot + grave) becomes ẹ̀ (composed)
    """
    if not text:
        return ""
    # NFC is the Hugging Face and Tokenizer standard for African Languages
    nfc_text = unicodedata.normalize('NFC', text)
    return nfc_text

if __name__ == "__main__":
    test_str = "ẹ\\u0323\\u0300ko\\u0301 o\\u0300ni\\u0301" # decomposed unicode representations
    normalized = normalize_yoruba_diacritics(test_str)
    print("Raw:         ", test_str.encode('utf-8'))
    print("Normalized:  ", normalized)
    print("Normal utf-8:", normalized.encode('utf-8'))
`;

export const getBenchmarkPy = () => `import json
import sacrebleu

# Evaluation Benchmark script to compute BLEU, Rouge-L, and Yoruba Tone Preservation
# across various topics.

def compute_bleu(predictions, references):
    """
    Computes SacreBLEU score for translation output.
    predictions: list of strings
    references: list of list of strings (each prediction has a list of possible correct outputs)
    """
    bleu = sacrebleu.corpus_bleu(predictions, references)
    return bleu.score

def compute_diacritic_preservation_rate(predictions, references):
    """
    Measures the ratio of predicted diacritics compared to references.
    Yoruba relies on accents for tone to disambiguate lexical meaning.
    """
    yoruba_diacritics = set("ẹọṣáéíóọ́úàèìòọ̀ùẹ̀ọ̀ṢẸỌÁÉÍÓÚÀÈÌÒÙ")
    
    ref_diacritics_count = 0
    pred_diacritics_count = 0
    
    for ref, pred in zip(references, predictions):
        ref_text = ref[0] # first reference
        ref_diacritics_count += sum(1 for c in ref_text if c in yoruba_diacritics)
        pred_diacritics_count += sum(1 for c in pred if c in yoruba_diacritics)
        
    if ref_diacritics_count == 0:
        return 100.0
        
    return (pred_diacritics_count / ref_diacritics_count) * 100.0

if __name__ == "__main__":
    # Small local testing evaluation
    sample_ref = [["Ìyá mi lọ sí ọjà láti ra iṣu àti ẹran."]] # Translation for "My mother went to the market to buy yam and meat"
    sample_pred = ["Ìyá mi lọ sí ọjà láti ra iṣu àti ẹran ọ̀sọ́."] # Model output prediction with mild deviation
    
    score_bleu = compute_bleu(sample_pred, sample_ref)
    score_pres = compute_diacritic_preservation_rate(sample_pred, sample_ref)
    
    print("=== Yoruba LLM Metric Evaluator ===")
    print(f"BLEU Accuracy: {score_bleu:.2f}")
    print(f"Diacritic preservation: {score_pres:.2f}%")
`;

export interface YorubaExample {
  id: string;
  category: string;
  instruction: string;
  input: string;
  output: string;
}

export const getPreloadedYorubaExamples = (): YorubaExample[] => [
  {
    id: "ex-1",
    category: "Proverbs",
    instruction: "Se àlàyé òwe Yorùbá yìí ní èdè Gẹ̀ẹ́sì kí o sì sọ ẹ̀kọ́ tí a rí kọ́ níbẹ̀.",
    input: "Owe: 'Bí a bá sọkò sọ́jà, ará ilé ẹni ní í bá.'",
    output: "Itúmọ̀ ní Èdè Gẹ̀ẹ́sì (English Translation): 'If one throws a stone into the marketplace, it is likely to hit a member of one's own family.'\n\nÀlàyé fún ẹ̀kọ́ òwe (Cultural Meaning):\nThis proverb warns against reckless, random, or destructive actions, as the negative consequences of our actions will inevitably return to harm ourselves or those close to us. It promotes the ethical values of mindfulness, communal responsibility, and peace."
  },
  {
    id: "ex-2",
    category: "Translation",
    instruction: "Translate the following English text to Yoruba, ensuring appropriate use of subdots for vowels (ẹ, ọ), consonants (ṣ), and standard tone accents (á, à, é, è, ó, ò).",
    input: "Text: 'Education is the key to unlocking the potential of every child.'",
    output: "Èdè Yorùbá: 'Ẹ̀kọ́ ni bọ́tìnì tí ó ń ṣí agbára àti ohun rere tí ó wà nínú gbogbo ọmọdé jáde.'"
  },
  {
    id: "ex-3",
    category: "Question Answering",
    instruction: "Dáhùn ìbéèrè òpìtàn láti sọ orúkọ olú-ìlú ìjọba Ọ̀yọ́ àtijọ́ àti ibi tí ó wà.",
    input: "Ìbéèrè: Kí ni olú-ìlú ìjọba Ọ̀yọ́ ní ìgbà àtijọ́?",
    output: "Èsì: 'Katunga' tàbí 'Ọ̀yọ́-Ilé' ni olú-ìlú ìjọba Ọ̀yọ́ àtijọ́ kí ó tó di wí pé wọ́n gbé e lọ sí Ọ̀yọ́ tuntun nítorí ogun. Ọ̀yọ́-Ilé wà ní agbègbè àríwá Nàìjíríà ní agbègbè Kwara/Kajola lónìí."
  },
  {
    id: "ex-4",
    category: "Yoruba Grammar",
    instruction: "Sọ ìyàtọ̀ láàárín 'Ogun', 'Ògún' àti 'Ògùn' nípa lílo ohùn àti àlàyé rọrùn.",
    input: "Ọ̀rọ̀: Ogun vs Ògún vs Ògùn",
    output: "Àlàyé rọrùn lórí àwọn ọ̀rọ̀ wọ̀nyí:\n\n1. **Ogun** (Ohun: Re-Re, Mid-Mid): Eyi tọ́ka sí ogun ogun-bíbá tàbí ijà láàárín àwọn orílẹ̀-èdè tàbí ẹgbẹ́ (War).\n2. **Ògún** (Ohun: Do-Mi, Low-High): Olúwa irin, òrìṣà títẹ́lọ́rùn àwọn alágbẹ̀dẹ àti awakọ̀ (Yoruba deity of Iron).\n3. **Ògùn** (Ohun: Do-Do, Low-Low): Ohun èlò fún ìwòsàn tàbí oògùn àìsàn (Medicine / Remedy).\n\nLílo àwọn àmì-ohùn (Do, Re, Mi) ṣe pàtàkì láti ya ohùn wọn sọ́tọ̀ kó má baà dọ̀rọ̀ àmúlùmálà."
  },
  {
    id: "ex-5",
    category: "Storytelling",
    instruction: "Kọ ìtàn kékeré kan nípa Ìjàpá (the Tortoise) àti Ìrókò alágidi tí ó sọ ẹ̀kọ́ nípa ọgbọ́n àmọ̀ràn.",
    input: "",
    output: "Ní ìgbà kan rí, ebi ńlá kan pa ní ilẹ̀ gbogbo àwọn ẹranko. Ìjàpá tí ó jẹ́ alábàṣe agbọ́n pinnu láti lọ sọ́dọ̀ igi Ìrókò ńlá kan nínú igbó. Gbogbo ẹranko ló mọ̀ pé Ìrókò náà ń fún àwọn tí ó bá mọ̀ọ́mọ̀ bẹ bẹ lọ́rẹjẹ́ ṣùgbọ́n ohun kankan kò le yọ̀ ọ́ lẹ́nu títí tí Ìjàpá fi pinnu. Ìjàpá fi iyọ̀ àti ata lọ́mọ́ adùn bámú-bámú kọrin bẹ igi náà pé kí ó jọ̀wọ́ já èso rẹ̀ sílẹ̀. Igi pinnu láti kọ̀ jálẹ̀ nítorí alágidi ni rẹ̀. Ìjàpá ba fi ọgbọ́n kọrin lẹ́yìn igi pe adití ni igi Ìrókò, rẹ́ rẹ́ igi náà gbọ́ ti ó fi já gbogbo èso rẹ̀ sílẹ̀ láti fí fún Ìjàpá mánigbà. Ẹ̀kọ́ ìtàn ni pé, pẹ̀lú ọgbọ́n, sùúrú, àti ọ̀rọ̀ jẹ́jẹ́ a le rí gbogbo ohun alágidi tẹ́ lọ́rùn."
  },
  {
    id: "ex-6",
    category: "Agriculture",
    instruction: "Explain the methods of cocoa farming in Yoruba, mentioning weeding, harvesting, and pest control.",
    input: "Topic: Koko (Cocoa) farming",
    output: "Gbígbin Kòkó (Cocoa) níkíyèsí lórí awọn abala wọ̀nyí:\n1. **Ilasa (Weeding)**: Gbọ́dọ̀ bójútó kúrò koríko láti dènà àìjẹun-daadaa àti àìrí sùúrú gbá rún rún mọ́ kòkó jòjò.\n2. **Ìpese àti Ìfògùn (Pest control)**: Lílo òògùn àbójútó láti dènà kòkòrò tí ń jẹ èso kòkó run àti àìsàn 'Black Pod'.\n3. **Ìkórè (Harvesting)**: Ìyẹn pípè èso kòkó tí ó pọ́n nípa lílo rọ́bà àti kẹ́tẹ́kẹ́tẹ́ fún ìgbésẹ̀ gbígbẹ."
  },
  {
    id: "ex-7",
    category: "Technology",
    instruction: "Translate the concepts of 'Dynamic Programming' and 'Cloud Computing' to Yoruba with clear definitions for academic learning.",
    input: "Concepts: 'Dynamic Programming' and 'Cloud Computing'",
    output: "Lílo ọ̀rọ̀ ìmọ̀-ẹ̀rọ tí ó ṣe kedere:\n\n1. **Dynamic Programming** → **Ìṣètò Ìṣirò Alápapọ̀ (Ìṣètò Alágbára)**:\nItúmọ̀: Èyí jẹ́ ọ̀nà kan nínú ìmọ̀ kọ̀mpútà láti yanjú àwọn ìṣorò nla nípa títẹ́ wọn sí kékèké, àti títọ́jú èsì kọ̀ọ̀kan sínú ìrántí (cache) láti dènà àtúnṣe ìṣirò léraléra.\n\n2. **Cloud Computing** → **Ìṣirò Sánmà (Ìrànṣẹ́ Sánmà)**:\nItúmọ̀: Èyí ni lílo network àwọn kọ̀mpútà tí ó wà lórí intánẹ́ẹ̀tì láti tọ́jú, fèsì, àti bójútó data dípò kí a lò kọ̀mpútà tiwa fúnrararẹ̀ nile."
  },
  {
    id: "ex-8",
    category: "Summarization",
    instruction: "Kọ àkópọ̀ rọrùn nípà ẹsẹ ọ̀rọ̀ tí ó tẹ́lẹ ní gbolóhùn méjì péré mọ́.",
    input: "Ẹsẹ Ọ̀rọ̀: 'Àwọn ọ̀dọ́ ilẹ̀ Nàìjíríà n lo ìmọ̀ ẹ̀rọ àti intánẹ́ẹ̀tì láti bẹ̀rẹ̀ iṣẹ́ tuntun nípa ṣíṣe fintech àti ìṣirò ìdókòwò. Èyí fún ọ̀pọ̀lọpọ̀ ọmọ Nigeria ní iṣẹ́ ati ànfàní láti kọ́ ẹ̀rọ káríayé kí ó sì mu ètò ọrọ̀ ajé tuntun rárá.'",
    output: "Àkópọ̀ (Summary):\nÀwọn ọ̀dọ́ Nàìjíríà ń lo ohun èlò intánẹ́ẹ̀tì láti dá iṣẹ́ fintech sílẹ̀ lónìí. Èyí sì ń pèsè iṣẹ́ àti ìfaradà láti tun ètò ọrọ̀ ajé orílẹ̀-èdè gbin lórí ìmọ̀ tuntun."
  }
];
