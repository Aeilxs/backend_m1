import os
import sys

def dump_directory(path, output):
    output.write(f"\n## {os.path.basename(path)}\n\n")
    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith(('.cpp', '.hpp', '.h', '.c', '.ts')):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, path)
                output.write(f"- {rel_path}\n")
                output.write("```\n")
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    output.write(f.read())
                output.write("\n```\n\n")

def main():
    if len(sys.argv) < 2:
        print("Usage: python dump_code.py <dir1> [<dir2> ...]")
        return

    with open("dump.md", "w", encoding='utf-8') as out:
        out.write("# FILES\n")
        for dir_path in sys.argv[1:]:
            if os.path.isdir(dir_path):
                dump_directory(dir_path, out)
            else:
                print(f"Skipping: {dir_path} is not a valid directory.")

if __name__ == "__main__":
    main()