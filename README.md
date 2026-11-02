# ai-video-m1demo

## Prompt-Example — QuickCart Support Bot

A customer-support chat app built with React, Flask and the OpenAI API.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/Venkat4655/ai-video-m1demo/blob/main/Prompt-Example/Prompt_Example_Colab.ipynb)

Click the badge, add `OPENAI_API_KEY` under Colab **Secrets** (🔑), then **Runtime → Run all**. The last cell prints a public link to the running app.

See [`Prompt-Example/README.md`](Prompt-Example/README.md) for running it locally.

### Live demo (GitHub Pages)

The `Deploy to GitHub Pages` workflow builds the React app in static mode and publishes it at
https://venkat4655.github.io/ai-video-m1demo/. There is no server there, so the page asks each visitor
for their own OpenAI API key. The key stays in that browser's local storage and is sent only to `api.openai.com`.
