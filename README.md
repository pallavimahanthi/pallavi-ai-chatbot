# Pallavi AI — Smart AI Assistant

A modern, professional ChatGPT-style chatbot website built with HTML, CSS, and JavaScript. Pallavi AI features a clean chat interface with dark/light themes, chat history sidebar, typing animations, and a demo response system.

## Features

- **ChatGPT-style chat interface** with message input box
- **User messages on the right, AI responses on the left**
- **New Chat button** to start a fresh conversation
- **Sidebar with chat history** — saved in localStorage
- **Copy Response** button on every AI message
- **Clear Chat** button to reset the current conversation
- **Typing animation** (animated dots) while the AI "generates" a response
- **Enter to send, Shift+Enter for new line**
- **Dark mode and light mode** toggle with persistence
- **Welcome screen** with heading "Hello! I'm Pallavi AI" and subtitle "Your smart AI assistant. Ask me anything."
- **Example prompt cards**: Explain Python, Interview Prep, Generate Project Idea, Write a Poem
- **Fully responsive** — works on mobile phones and desktop computers

## Demo Mode

Pallavi AI runs in **demo mode**. Responses are simulated using a built-in response system — no real AI model or API is connected. This is clearly labeled in the interface and in every response. The demo system recognizes topics like Python, interviews, project ideas, and poems, and provides helpful pre-written answers.

To connect a real AI model, you would need to integrate an API key and a backend service — that is beyond the scope of this front-end demo.

## How to Run

1. Open the project folder
2. Run `npm install` to install Vite (the dev server)
3. Run `npm run dev` to start the local server
4. Open the URL shown in the terminal (usually `http://localhost:5173`)

Alternatively, just open `index.html` directly in any modern web browser.

## Technologies

- HTML5
- CSS3 (custom properties, Grid, Flexbox, animations)
- Vanilla JavaScript (no frameworks)
- Vite (dev server only)
- localStorage for chat and theme persistence

## File Structure

```
pallavi-ai/
├── index.html      # Main HTML structure
├── style.css       # All styling, themes, responsive design
├── script.js       # Chat logic, demo responses, state management
├── package.json    # Project config for Vite dev server
├── vite.config.js  # Vite configuration
└── README.md       # This file
```

## College Project Notes

This project demonstrates:
- Modern UI/UX design with CSS custom properties for theming
- Responsive layout techniques (sidebar drawer on mobile, grid on desktop)
- JavaScript state management without frameworks
- localStorage for data persistence
- Smooth animations and micro-interactions
- Clean, organized, beginner-friendly code with comments
