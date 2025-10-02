# Pilah AI - EcoScan

Pilah AI is a smart recycling assistant that uses image classification to identify different types of waste, helping users recycle more effectively. It's a multi-page web application designed to be educational, engaging, and easy to use.

## ✨ Key Features

*   **Smart Waste Classification**: Upload an image of a waste item, and the app will identify it as one of six categories: cardboard, glass, metal, paper, plastic, or trash.
*   **Gamified Recycling**: Earn points for every item you scan and redeem them for rewards.
*   **Activity Tracking**: Keep a log of all your scans and monitor your recycling habits over time.
*   **Educational Content**: Learn interesting facts about recycling and waste management.
*   **Multi-Page Interface**: A full-featured application with a dashboard, scanning page, activity log, and rewards wallet.

## 🛠️ Tech Stack

*   **Backend**: Flask, TensorFlow Lite
*   **Frontend**: HTML, CSS, JavaScript
*   **Machine Learning Model**: ResNet50 (pre-trained for image classification)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Python 3.7+
*   pip

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/username/pilah-ai.git
    ```
2.  **Install backend dependencies**
    ```sh
    pip install -r backend/requirements.txt
    ```
3.  **Ensure the TFLite model is present**
    The pre-trained model should be located at `backend/models/trash_classifier_resnet50.tflite`.

### Running the Application

1.  **Start the Flask server**
    ```sh
    python backend/app.py
    ```
2.  **Open the application in your browser**
    Navigate to `http://127.0.0.1:5000`

## 📁 File Structure

```
pilah-ai/
├── backend/            # Backend server and machine learning model
│   ├── app.py          # Main Flask application
│   ├── models/         # TFLite model files
│   └── requirements.txt # Python dependencies
├── static/             # Frontend assets
│   ├── css/            # Stylesheets
│   └── js/             # JavaScript files
└── templates/          # HTML templates
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.