#!/usr/bin/env python3

# Simple test script to verify the sentiment analysis improvements
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from sentiment_from_images import is_meaningful_text
    
    print("Testing text meaningfulness detection:")
    print("-" * 50)
    
    test_cases = [
        "389k",
        "v5", 
        "clpds oisu weh3u4",
        "a3b c5d e7f",
        "Hello, this is a normal sentence",
        "I love this product",
        "This is terrible and awful",
        "abc def ghi",
        "12345",
        "v5.jpg",
        "random text here"
    ]
    
    for test_text in test_cases:
        result = is_meaningful_text(test_text)
        print(f"'{test_text}' -> {'Meaningful' if result else 'Not meaningful'}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()