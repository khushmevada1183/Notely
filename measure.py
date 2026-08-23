import subprocess
import os
import re

def get_pss():
    try:
        pids = subprocess.check_output(['pgrep', '-f', 'code-oss']).decode('utf-8').split()
    except subprocess.CalledProcessError:
        print("No processes found.")
        return
    
    total_pss_kb = 0
    for pid in pids:
        try:
            with open(f'/proc/{pid}/smaps_rollup', 'r') as f:
                content = f.read()
                match = re.search(r'^Pss:\s+(\d+)\s+kB', content, re.MULTILINE)
                if match:
                    pss = int(match.group(1))
                    print(f"PID {pid} PSS: {pss / 1024:.2f} MB")
                    total_pss_kb += pss
        except (FileNotFoundError, ProcessLookupError):
            continue
            
    print(f"Total PSS: {total_pss_kb / 1024:.2f} MB")

get_pss()
