# Step 1: Import libraries
import pandas as pd
import df 
import math

# Step 2: Load the CSV data
file_path = 'Users/tim/Documents/GitHub/The-Running-Machine/Script/RunningData.csv'  # Replace with your actual file path 
# Specify the filename
filename = 'RunningData.csv'  # replace with your actual CSV file name

# Read the CSV file into a DataFrame
try:
    df = pd.read_csv(filename)
    print(df.head())  # Print the first few rows to check if data is loaded correctly
except pd.errors.EmptyDataError:
    print("The file is empty or could not be read.")
except FileNotFoundError:
    print("The file was not found. Please check the file name and path.")
except Exception as e:
    print(f"An error occurred: {e}") 

# Strip any leading/trailing whitespace from column names
df.columns = df.columns.str.strip() 

# Define the cleaning function
def clean_time_format(time_str):
    if pd.isna(time_str):
        return time_str  # Return NaN as is
    parts = time_str.split(':')
    # If there are only two components (mm:ss), add "00:" in front
    if len(parts) == 2:
        return f"00:{time_str}"
    # If there are three components (hh:mm:ss), return as is
    return time_str

# Apply the cleaning function to the 'Time' column
df['Cleaned Time'] = df['Time'].apply(clean_time_format)

# Create a new column for Total Seconds
def calculate_total_seconds(time_str):
    if pd.isna(time_str):
        return None  # Return None for NaN
    hours, minutes, seconds = map(int, time_str.split(':'))
    return hours * 3600 + minutes * 60 + seconds

# Apply the function to create the Total Seconds column
df['Total Seconds'] = df['Cleaned Time'].apply(calculate_total_seconds)

# Check the DataFrame with the new columns
print(df[['Time', 'Cleaned Time', 'Total Seconds']]) 

df.reset_index(drop=True, inplace=True)

# Step 2: Convert necessary columns to appropriate data types
df['Distance'] = df['Distance'].str.replace(' mi', '').astype(float)
df['Heart Rate'] = df['Heart Rate'].astype(int)

# Step 3: Calculate Pace in seconds per mile
df['Pace (sec/mile)'] = df['Total Seconds'] / df['Distance']

# Function to convert seconds to mm:ss format
def convert_seconds_to_pace(seconds):
    if pd.isna(seconds) or seconds == float('inf') or seconds == float('-inf'):  # Check for NaN, inf, or -inf
        return None  # Return None for invalid values
    mins = seconds // 60  
    secs = float((math.trunc(seconds % 60))/100)

    t = mins + secs
    return t


# Function to update pace in the DataFrame and check for invalid values
def update_pace_column(df, pace_column):
    count_invalid = 0  # Counter for invalid values
    for index in range(len(df)):
        pace_value = df.at[index, pace_column]
        converted_pace = convert_seconds_to_pace(pace_value)
        
        # Update the Pace column
        df.at[index, 'Pace'] = converted_pace
        
        # Check if the converted pace is greater than 10 seconds per mile
        if converted_pace is not None and converted_pace > 12:
            count_invalid += 1 
            mins = converted_pace // 60  
            secs = float((math.trunc(converted_pace % 60))/100)

            t = mins + secs
            if t is not None and t > 12:
                count_invalid -= 1

                # Update the Pace column
                df.at[index, 'Pace'] = t

    return count_invalid

# Example usage
# Replace 'Pace (sec/mile)' with your actual column name
count_invalid_paces = update_pace_column(df, 'Pace (sec/mile)') 


print(df['Pace'])


