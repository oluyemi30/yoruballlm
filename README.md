# ÀṢÀ LLM — Yoruba Language Intelligence & fine-tuning pipeline

Àṣà LLM is a robust, production-ready, full-stack West African Language Model fine-tuning dashboard and linguistic playground. It combines cutting-edge parameter-efficient fine-tuning (PEFT/QLoRA) structures, Unicode clean-up procedures, custom synthetics data engines, and standard metric checkers specifically engineered to target Yoruba's low-resource NLP constraints.

---

## 🚀 Core Philosophy & Startup Strategy
Our research outlines a lean four-phase MVP strategy for startup success on West African linguistics pipelines:
1. **Phase 1: Chatbot (MVP)**: Fine-tune high-performance foundation models (such as Qwen-2.5-3B or Llama-8B) on tone-balanced chat prompts, folk proverbs, and custom orthography pairs.
2. **Phase 2: Bidirectional Translator**: Expand weights towards bilingual English ↔ Yoruba translation APIs, prioritizing precise vowel accent marks.
3. **Phase 3: Assistive Speech Audio**: Mount Whisper/MMS acoustic models to recognize verbal inputs, combined with native TTS voice synthesizers.
4. **Phase 4: Specialized Tutors**: Distribute classroom tutoring and corporate customer service bots natively conversing in standard Oyo/Literary Yoruba.

---

## 🛠️ Main Infrastructure Components

### 1. Data Acquisition & Normalization Pipeline (NFC Normalization)
Yoruba language is characterized by frequent diacritics indicating tones (High: acute `á`, Low: grave `à`, Mid: unmarked `a`) and subdots for open mid-vowels (`ẹ`, `ọ`) and the postalveolar fricative (`ṣ`).
- **Unicode Composition (NFC)**: Frequently, datasets scraping the web represent these as separate decomposed code points (letters + diacritic markers). This splits tokens inside modern BPE/SentencePiece tokenizers, destroying semantic contextual learning.
- **Normalizer**: Àṣà LLM executes Unicode Form NFC mappings `unicodedata.normalize('NFC', text)` to bind diacritics directly to their native letters.

### 2. LoRA Hyperparameter Configurations
* Under the Administrative Console (`/admin`), you can tweak parameters including:
  * **LoRA Rank ($r$)**: `8`, `16`, `32`, or `64`.
  * **LoRA Alpha ($\alpha$)**: Scaling factor (typically double of $r$).
  * **Target Modules**: `q_proj`, `v_proj`, `k_proj`, `o_proj`, etc.
  * **Learning Rate**: `2e-4` (Standard AdamW).
  * **Quantization**: 4-bit Double Quantization (QLoRA) using `bitsandbytes`.

### 3. Alpaca-Format Instruction Dataset Builder
The dataset playground formats and exports PEFT-friendly instruction items:
```json
{
  "instruction": "Kọ́ mi ní òwe kan lórí ọ̀pọ̀lọpọ̀ ọgbọ́n.",
  "input": "Owe Yoruba",
  "output": "Itúmọ̀: 'Ọmọ tó mọ ayé jẹ kò ní rìn ràhìn.' (A wise child behaves prudently.)"
}
```

### 4. Benchmark Metric Evaluator
* Calculates linguistic metrics on generated Yoruba candidate outputs:
  * **BLEU Rating**: Measures n-gram overlap against golden references.
  * **chrF-2 Score**: Essential for character-level diacritic correctness.
  * **Diacritic Density**: Ratio of accented letters (`ẹ`, `ọ`, `ṣ`, `á`, `à`, etc.) against standard Latin letters.

---

## 📂 Architecture Scripts Directory
Inside the Admin dashboard, you can view, customize, and copy standard production-grade scripts:
- `train.py`: Standard QLoRA Fine-tuning executable using Hugging Face's `SFTTrainer`/`Trainer`.
- `evaluate.py`: Standard SacreBLEU evaluation evaluator with diacritic sanitizers.
- `inference.py`: Model loader and dynamic conversation streamer.
- `requirements.txt`: Python package listing.
- `scraper.py` / `cleaner.py`: Web scraper triggers with regex pattern normalization.

---

## 🔐 Administration Protocol
The administrative workspace has been encapsulated within the `/admin` view context to guarantee clean user-facing landing journeys for product owners while maintaining complete control over model checkpoints, hyperparameter curves, and datasets for research engineers.
