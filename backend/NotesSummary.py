
from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
import re
import heapq
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
import os

app = Flask(__name__)
CORS(app)

def clean_html_text(text):
    """Remove HTML tags and clean text using regex"""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'&[a-z]+;', '', text)
    text = re.sub(r'\[\d+\]', '', text)
    text = re.sub(r'\^\d+', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def summarize_sentences(sentences, summary_ratio=0.3):
    """Summarize a list of sentences using word frequencies"""
    stop_words = set(stopwords.words("english"))
    word_frequencies = {}

    for sent in sentences:
        for word in word_tokenize(sent.lower()):
            if word.isalpha() and word not in stop_words:
                word_frequencies[word] = word_frequencies.get(word, 0) + 1

    max_freq = max(word_frequencies.values()) if word_frequencies else 1
    for word in word_frequencies:
        word_frequencies[word] /= max_freq

    sentence_scores = {}
    for sent in sentences:
        for word in word_tokenize(sent.lower()):
            if word in word_frequencies:
                sentence_scores[sent] = sentence_scores.get(sent, 0) + word_frequencies[word]

    summary_length = max(1, int(len(sentences) * summary_ratio))
    summary_sentences = heapq.nlargest(summary_length, sentence_scores, key=sentence_scores.get)
    return " ".join(summary_sentences)

def large_text_summarizer(text, chunk_size_sentences=100, summary_ratio=0.3):
    """Summarize very large text in a memory-efficient way"""
    text = clean_html_text(text)
    sentences = sent_tokenize(text)
    if not sentences:
        return ""

    # Split sentences into chunks
    chunks = [sentences[i:i+chunk_size_sentences] for i in range(0, len(sentences), chunk_size_sentences)]
    partial_summaries = [summarize_sentences(chunk, summary_ratio) for chunk in chunks]

    # Combine partial summaries and summarize again
    combined_sentences = sent_tokenize(" ".join(partial_summaries))
    final_summary = summarize_sentences(combined_sentences, summary_ratio)
    return final_summary

@app.route('/api/summarize', methods=['POST'])
def summarize_text():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400

        text = data['text']
        if not text.strip():
            return jsonify({'error': 'Text is empty'}), 400

        chunk_size = data.get('chunk_size', 100)  # number of sentences per chunk
        summary_ratio = data.get('summary_ratio', 0.3)

        summary = large_text_summarizer(text, chunk_size, summary_ratio)

        return jsonify({
            'summary': summary,
            'original_length': len(text),
            'summary_length': len(summary),
            'reduction_rate': f"{((len(text) - len(summary)) / len(text) * 100):.1f}%"
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'service': 'Text Summarization API'})

if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
