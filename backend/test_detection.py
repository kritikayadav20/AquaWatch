
import unittest
import numpy as np
import cv2
import sys
import os

# Ensure we can import from current directory
sys.path.append(os.getcwd())

from image_processing import detect_hyacinth

class TestHyacinthDetection(unittest.TestCase):
    def test_green_detection(self):
        # Create a 100x100 image
        # half green, half blue
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        
        # Add random noise to simulate leaf texture
        # Create random noise in the green area
        noise = np.random.randint(0, 100, (50, 100, 3), dtype=np.uint8)
        # We want to subtract or add this to give texture, but keep it Green
        # Let's just create a textured green block
        # Random green variations:
        green_texture = np.zeros((50, 100, 3), dtype=np.uint8)
        green_texture[:, :, 1] = np.random.randint(150, 255, (50, 100)) # Green High
        green_texture[:, :, 0] = np.random.randint(0, 50, (50, 100))    # Blue Low
        green_texture[:, :, 2] = np.random.randint(0, 50, (50, 100))    # Red Low
        
        img[0:50, :] = green_texture
            
        # Encode to bytes
        _, encoded_img = cv2.imencode('.jpg', img)
        img_bytes = encoded_img.tobytes()
        
        # Detect
        coverage = detect_hyacinth(img_bytes)
        print(f"Test Coverage: {coverage}%")
        
        # Should be roughly 50%
        self.assertTrue(40 <= coverage <= 60, f"Coverage {coverage}% not within expected range 40-60%")

    def test_no_plant(self):
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        img[:] = (255, 0, 0) # Blue
        
        _, encoded_img = cv2.imencode('.jpg', img)
        img_bytes = encoded_img.tobytes()
        
        coverage = detect_hyacinth(img_bytes)
        print(f"Test No Plant Coverage: {coverage}%")
        self.assertEqual(coverage, 0.0)

if __name__ == '__main__':
    unittest.main()
