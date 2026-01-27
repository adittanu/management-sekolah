import pandas as pd
import json
import os

def analyze_student_file(filepath):
    try:
        df = pd.read_excel(filepath)
        sample_data = df.head(3).to_dict(orient='records')
        
        analysis = {
            'file_name': os.path.basename(filepath),
            'columns': df.columns.tolist(),
            'sample_data': sample_data,
            'unique_cohorts': df['cohort1'].unique().tolist() if 'cohort1' in df.columns else []
        }
        print(json.dumps(analysis, default=str))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    analyze_student_file("import/XI-ACE1 user student.xlsx")
