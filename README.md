# Banking Dashboard Project

This project contains a banking dashboard interface with dynamic content loading and interactive features.

## Project Generation

This entire project was generated using Claude 3.5 Sonnet, an advanced AI language model developed by Anthropic.

## Project Structure

- `index.html` - Main dashboard interface
- `styles.css` - Dashboard styling
- `dashboard.js` - Dashboard functionality

## Python Configuration

### Requirements
- Python 3.8 or higher
- pip package manager

### Setup
1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

### Running Python Scripts
Execute the main script from the project root:
```bash
python src/main.py
```

Run the backend server with:
```bash
uvicorn backend:app --reload
```

## Frontend Development

### Live Server Setup
1. Open VSCode Extensions panel (Ctrl+Shift+X or View -> Extensions)
2. Search for "Live Server" by Ritwick Dey
3. Click "Install" button
4. After installation, right-click on `index.html` and select "Open with Live Server"
   - Alternatively, click "Go Live" in the bottom status bar
   - The frontend will be available at `http://127.0.0.1:5500`

## Note

All code and assets in this project were auto-generated for demonstration purposes.
