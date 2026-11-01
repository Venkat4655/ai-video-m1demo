# QuickCart Support Bot

A simple AI customer support chat app built with React, Flask, and the OpenAI API.

## Setup

**1. Add your API key**

Open `backend/.env` and paste your key after `OPENAI_API_KEY=`.

**2. Start the backend** (first terminal)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**3. Start the frontend** (second terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5183. The backend runs on port 5050.

## Try it

| Message | What happens |
| --- | --- |
| `Where is QC-1001?` | Fetches the order and answers from its details |
| `What is your return policy?` | Answers from `faq.txt` |
| `Where is my order?` | The LLM asks for the order number |
| `Where is QC-9999?` | The app says it wasn't found, without calling the LLM |
| `Check order 1001` | Treated as invalid, because order numbers need the `QC-` prefix |

Sample orders are QC-1001 to QC-1005. Open **Show Under the Hood** to see the Rules, Facts, and Question for the latest message.

## How it works

1. `app.py` validates the message: it must be text, not empty, and at most 500 characters.
2. It looks for order numbers and fetches any matches from `orders.json`.
3. If every order number it found is unknown, it replies directly and never calls the LLM.
4. Otherwise it sends the **Rules** as the system message, and the **Facts** (`faq.txt` plus the order lookup) and **Question** as the user message.

Each message is handled on its own, so the bot doesn't remember earlier messages. Include the order number in every order question.

## Run in Google Colab

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/Venkat4655/ai-video-m1demo/blob/main/Prompt-Example/Prompt_Example_Colab.ipynb)

Add `OPENAI_API_KEY` in Colab Secrets, run all cells, and open the public link printed by the last cell.
