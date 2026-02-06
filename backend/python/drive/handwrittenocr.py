# from transformers import TrOCRProcessor, VisionEncoderDecoderModel
# from PIL import Image
# import torch
# import cv2
# import numpy as np

# # -------------------------------
# # 1. Load Model
# # -------------------------------
# processor = TrOCRProcessor.from_pretrained(
#     "microsoft/trocr-large-handwritten"
# )
# model = VisionEncoderDecoderModel.from_pretrained(
#     "microsoft/trocr-large-handwritten"
# )

# device = "cuda" if torch.cuda.is_available() else "cpu"
# model.to(device)

# # -------------------------------
# # 2. Image Preprocessing
# # -------------------------------
# def preprocess(image_path):
#     img = cv2.imread(image_path)
#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

#     # Adaptive threshold
#     thresh = cv2.adaptiveThreshold(
#         gray, 255,
#         cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
#         cv2.THRESH_BINARY_INV,
#         25, 15
#     )

#     return img, thresh

# # -------------------------------
# # 3. Line Segmentation
# # -------------------------------
# def segment_lines(img, thresh):
#     kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (50, 3))
#     dilated = cv2.dilate(thresh, kernel, iterations=1)

#     contours, _ = cv2.findContours(
#         dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
#     )

#     lines = []
#     for cnt in contours:
#         x, y, w, h = cv2.boundingRect(cnt)
#         if h > 25 and w > 100:  # filter noise
#             lines.append((y, x, w, h))

#     # Sort top to bottom
#     lines.sort(key=lambda x: x[0])

#     return lines

# # -------------------------------
# # 4. OCR Each Line
# # -------------------------------
# def ocr_lines(img, lines):
#     results = []

#     for y, x, w, h in lines:
#         line_img = img[y:y+h, x:x+w]
#         line_img = cv2.resize(line_img, (800, 64))
#         line_pil = Image.fromarray(line_img).convert("RGB")

#         pixel_values = processor(
#             images=line_pil,
#             return_tensors="pt"
#         ).pixel_values.to(device)

#         ids = model.generate(pixel_values, max_length=64)
#         text = processor.batch_decode(
#             ids, skip_special_tokens=True
#         )[0]

#         results.append(text)

#     return results

# # -------------------------------
# # 5. Run Everything
# # -------------------------------
# image_path = "test2.jpg"
# img, thresh = preprocess(image_path)
# lines = segment_lines(img, thresh)
# text_lines = ocr_lines(img, lines)

# print("\n===== FINAL OUTPUT =====\n")
# for line in text_lines:
#     print(line)


import ssl
# Temporary fix for SSL certificate error
ssl._create_default_https_context = ssl._create_unverified_context

import easyocr
import cv2
import matplotlib.pyplot as plt
from PIL import Image
import numpy as np

# Initialize the reader (downloads models on first run)
# For English only: ['en']
# For multiple languages: ['en', 'es', 'fr'] etc.
reader = easyocr.Reader(['en'], gpu=False)  # Set gpu=True if you have CUDA

def recognize_handwriting(image_path):
    """
    Recognize handwritten text from an image
    
    Args:
        image_path: Path to the image file
    
    Returns:
        List of detected text with bounding boxes and confidence scores
    """
    # Read the image
    result = reader.readtext(image_path)
    
    return result

def display_results(image_path, results):
    """
    Display the image with detected text overlaid
    
    Args:
        image_path: Path to the image file
        results: Output from readtext()
    """
    # Read image using OpenCV
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Draw bounding boxes and text
    for (bbox, text, prob) in results:
        # Get coordinates
        top_left = tuple([int(val) for val in bbox[0]])
        bottom_right = tuple([int(val) for val in bbox[2]])
        
        # Draw rectangle
        cv2.rectangle(img, top_left, bottom_right, (0, 255, 0), 2)
        
        # Put text
        cv2.putText(img, text, top_left, cv2.FONT_HERSHEY_SIMPLEX, 
                    0.8, (255, 0, 0), 2)
    
    # Display
    plt.figure(figsize=(12, 8))
    plt.imshow(img)
    plt.axis('off')
    plt.title('Detected Handwritten Text')
    plt.show()

def extract_text_only(results):
    """
    Extract only the text from results
    
    Args:
        results: Output from readtext()
    
    Returns:
        String with all detected text
    """
    text_list = [text for (bbox, text, prob) in results]
    return ' '.join(text_list)

# Main execution
if __name__ == "__main__":
    # Replace with your image path
    image_path = 'test.jpeg'
    
    print("Processing image...")
    
    # Recognize text
    results = recognize_handwriting(image_path)
    
    # Print detailed results
    print("\n=== Detailed Results ===")
    for (bbox, text, confidence) in results:
        print(f"Text: {text}")
        print(f"Confidence: {confidence:.2f}")
        print(f"Bounding Box: {bbox}")
        print("-" * 50)
    
    # Extract and print all text
    print("\n=== Extracted Text ===")
    full_text = extract_text_only(results)
    print(full_text)
    
    # Display image with detected text
    display_results(image_path, results)
    
    # Optional: Save results to file
    with open('recognized_text.txt', 'w', encoding='utf-8') as f:
        f.write(full_text)
    print("\nText saved to 'recognized_text.txt'")


# from transformers import TrOCRProcessor, VisionEncoderDecoderModel
# from PIL import Image
# import torch
# import cv2
# import numpy as np
# import matplotlib.pyplot as plt

# # Load model
# processor = TrOCRProcessor.from_pretrained("microsoft/trocr-large-handwritten")
# model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-large-handwritten")

# device = "cuda" if torch.cuda.is_available() else "cpu"
# model.to(device)

# def preprocess_image(image_path):
#     """
#     Load and preprocess the image
#     """
#     img = cv2.imread(image_path)
#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
#     return img, gray

# def segment_lines_robust(image_path, min_line_height=20, kernel_width=50):
#     """
#     Robust line segmentation for handwritten text
#     """
#     img, gray = preprocess_image(image_path)
    
#     # Apply binary threshold
#     _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
#     # Use smaller kernel for better separation
#     kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_width, 1))
#     dilated = cv2.dilate(binary, kernel, iterations=1)
    
#     # Find contours
#     contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
#     # Get bounding boxes
#     boxes = []
#     for cnt in contours:
#         x, y, w, h = cv2.boundingRect(cnt)
#         if h >= min_line_height and w > 100:  # Filter noise
#             boxes.append((y, x, y+h, x+w))
    
#     # Sort by y-coordinate (top to bottom)
#     boxes.sort(key=lambda b: b[0])
    
#     return img, boxes

# def split_into_lines_manually(image_path, num_lines=4, crop_top_percent=0, crop_bottom_percent=0):
#     """
#     Simple approach: divide image into equal horizontal strips
#     Use this if automatic segmentation fails
#     """
#     img = cv2.imread(image_path)
#     h, w = img.shape[:2]
    
#     # Crop out empty space
#     crop_top = int(h * crop_top_percent)
#     crop_bottom = int(h * (1 - crop_bottom_percent))
    
#     # Calculate line height in the cropped region
#     usable_height = crop_bottom - crop_top
#     line_height = usable_height // num_lines
    
#     boxes = []
#     for i in range(num_lines):
#         y1 = crop_top + (i * line_height)
#         y2 = crop_top + ((i + 1) * line_height) if i < num_lines - 1 else crop_bottom
#         boxes.append((y1, 0, y2, w))
    
#     return img, boxes

# def recognize_line(line_img):
#     """
#     Recognize text in a single line image
#     """
#     # Convert to PIL
#     if len(line_img.shape) == 3:
#         line_pil = Image.fromarray(cv2.cvtColor(line_img, cv2.COLOR_BGR2RGB))
#     else:
#         line_pil = Image.fromarray(line_img).convert("RGB")
    
#     # Process
#     pixel_values = processor(line_pil, return_tensors="pt").pixel_values.to(device)
    
#     # Generate with better parameters
#     generated_ids = model.generate(
#         pixel_values, 
#         max_length=128,  # Longer text allowed
#         num_beams=5,     # Better quality
#     )
    
#     # Decode
#     text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
#     return text

# def visualize_lines(img, boxes):
#     """
#     Show detected lines
#     """
#     vis_img = img.copy()
    
#     for i, (y1, x1, y2, x2) in enumerate(boxes):
#         cv2.rectangle(vis_img, (x1, y1), (x2, y2), (0, 255, 0), 2)
#         cv2.putText(vis_img, f"Line {i+1}", (x1+5, y1+20), 
#                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
    
#     plt.figure(figsize=(15, 8))
#     plt.imshow(cv2.cvtColor(vis_img, cv2.COLOR_BGR2RGB))
#     plt.title(f"Detected {len(boxes)} Lines")
#     plt.axis('off')
#     plt.show()

# def recognize_document(image_path, method='auto', num_lines=4, crop_top=0.15, crop_bottom=0.05, visualize=True):
#     """
#     Main function with two methods:
#     - 'auto': automatic line detection
#     - 'manual': split into equal parts
    
#     Parameters:
#     - crop_top: percentage of image to crop from top (0.15 = 15%)
#     - crop_bottom: percentage to crop from bottom (0.05 = 5%)
#     """
#     print(f"Processing with {method} method...")
    
#     if method == 'auto':
#         # Try automatic segmentation
#         img, boxes = segment_lines_robust(image_path, min_line_height=15, kernel_width=30)
        
#         # If too few lines detected, try manual
#         if len(boxes) < 2:
#             print(f"Only found {len(boxes)} line(s). Switching to manual method...")
#             img, boxes = split_into_lines_manually(image_path, num_lines, crop_top, crop_bottom)
#     else:
#         img, boxes = split_into_lines_manually(image_path, num_lines, crop_top, crop_bottom)
    
#     print(f"Processing {len(boxes)} lines...")
    
#     if visualize:
#         visualize_lines(img, boxes)
    
#     # Recognize each line
#     results = []
#     for i, (y1, x1, y2, x2) in enumerate(boxes):
#         print(f"Reading line {i+1}/{len(boxes)}...", end=" ")
        
#         # Extract line with padding
#         padding = 5
#         y1_pad = max(0, y1 - padding)
#         y2_pad = min(img.shape[0], y2 + padding)
#         x1_pad = max(0, x1 - padding)
#         x2_pad = min(img.shape[1], x2 + padding)
        
#         line_img = img[y1_pad:y2_pad, x1_pad:x2_pad]
        
#         # Skip very small regions
#         if line_img.shape[0] < 10 or line_img.shape[1] < 50:
#             print("(skipped - too small)")
#             continue
        
#         text = recognize_line(line_img)
#         results.append(text)
#         print(f"'{text}'")
    
#     return results

# # Main execution
# if __name__ == "__main__":
#     image_path = "test3.png"
    
# # Main execution
# if __name__ == "__main__":
#     image_path = "test3.png"
    
#     # Universal approach: Try automatic first, fall back to manual only if needed
#     print("\n=== Processing Image ===")
    
#     # Try automatic detection
#     img, boxes = segment_lines_robust(image_path, min_line_height=15, kernel_width=30)
    
#     if len(boxes) >= 2:
#         # Automatic worked!
#         print(f"✓ Automatic detection found {len(boxes)} lines")
#         results = recognize_document(image_path, method='auto', visualize=True)
#     else:
#         # Automatic failed, ask user for number of lines
#         print(f"⚠ Automatic detection only found {len(boxes)} line(s)")
        
#         # Option 1: Guess 4 lines as default
#         print("Using manual split with 4 lines (adjust if needed)...")
#         results = recognize_document(image_path, method='manual', num_lines=4, 
#                                     crop_top=0.15, crop_bottom=0.05, visualize=True)
        
#         # Option 2: Uncomment to ask user
#         # num_lines = int(input("How many lines are in the image? "))
#         # results = recognize_document(image_path, method='manual', num_lines=num_lines, 
#         #                             crop_top=0.1, crop_bottom=0.05, visualize=True)
    
#     print("\n===== RECOGNIZED TEXT =====")
#     full_text = []
#     for i, line in enumerate(results, 1):
#         print(f"Line {i}: {line}")
#         full_text.append(line)
    
#     # Save results
#     with open("recognized_text.txt", "w", encoding="utf-8") as f:
#         f.write("\n".join(full_text))
    
#     print("\n✓ Text saved to 'recognized_text.txt'")