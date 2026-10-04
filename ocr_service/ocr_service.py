from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
from pdf2image import convert_from_path
import os
import re

app = Flask(__name__)

def normalize(text):
    return re.sub(r'\s+', ' ', str(text)).strip().lower()

def extract_text(file_path):
    extension = os.path.splitext(file_path)[1].lower()

    if extension == '.pdf':
        pages = convert_from_path(file_path)
        return '\n'.join(pytesseract.image_to_string(page) for page in pages)

    image = Image.open(file_path)
    return pytesseract.image_to_string(image)

@app.post('/verify')
def verify():
    uploaded = request.files.get('file')

    if not uploaded:
        return jsonify({
            'result': 'error',
            'isVerified': False,
            'message': 'No document received.'
        }), 400

    register_number = normalize(request.form.get('registerNumber', ''))
    student_name = normalize(request.form.get('studentName', ''))
    company_name = normalize(request.form.get('companyName', ''))

    temp_path = os.path.join('/tmp', uploaded.filename)
    uploaded.save(temp_path)

    try:
        text = normalize(extract_text(temp_path))

        checks = {
            'registerNumber': bool(register_number and register_number in text),
            'studentName': bool(student_name and student_name in text),
            'companyName': bool(company_name and company_name in text)
        }

        verified = all(checks.values())

        return jsonify({
            'result': 'success',
            'isVerified': verified,
            'checks': checks,
            'message': (
                'Document verified successfully.'
                if verified
                else 'Document details could not be verified.'
            )
        })
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)