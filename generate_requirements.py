import os
import sys

def generate_requirements():
    try:
        os.system("poetry export -f requirements.txt --output requirements.txt --without-hashes")
        print("requirements.txt file generated successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    generate_requirements()
