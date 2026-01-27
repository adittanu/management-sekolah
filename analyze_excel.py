import pandas as pd
import glob
import os
import json

def analyze_excel_files(directory):
    files = glob.glob(os.path.join(directory, "*.xlsx"))
    if not files:
        print(json.dumps({"error": "No xlsx files found"}))
        return

    analysis = {}
    
    # Analyze the first file to get structure
    first_file = files[0]
    try:
        # Load the workbook to check sheets
        xl = pd.ExcelFile(first_file)
        sheet_names = xl.sheet_names
        
        # Read the first sheet
        df = pd.read_excel(first_file)
        
        columns = df.columns.tolist()
        sample_data = df.head(3).to_dict(orient='records')
        
        analysis['structure'] = {
            'file_name': os.path.basename(first_file),
            'sheets': sheet_names,
            'columns': columns,
            'sample_data': sample_data,
            'row_count': len(df)
        }
        
        # Check consistency across other files
        inconsistent_files = []
        total_rows = len(df)
        
        for f in files[1:]:
            try:
                temp_df = pd.read_excel(f)
                total_rows += len(temp_df)
                if temp_df.columns.tolist() != columns:
                    inconsistent_files.append({
                        'file': os.path.basename(f),
                        'columns': temp_df.columns.tolist()
                    })
            except Exception as e:
                inconsistent_files.append({
                    'file': os.path.basename(f),
                    'error': str(e)
                })
        
        analysis['consistency'] = {
            'total_files': len(files),
            'total_rows_estimated': total_rows,
            'inconsistent_files': inconsistent_files,
            'consistent': len(inconsistent_files) == 0
        }
        
        print(json.dumps(analysis, default=str))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    # Install pandas if not present
    try:
        import pandas
    except ImportError:
        import subprocess
        import sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas"])
        import pandas
        
    analyze_excel_files("import")
