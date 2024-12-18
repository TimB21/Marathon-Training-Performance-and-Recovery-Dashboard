# Import necessary libraries
import pandas as pd

# Define the file path (update this with your actual file path)
file_path = 'Script/RunningData.csv'

def read_and_parse_file(file_path):
    """
    Reads and parses the CSV file. Handles various delimiters and errors.
    
    Args:
        file_path (str): Path to the CSV file.
    
    Returns:
        pd.DataFrame: Parsed DataFrame with cleaned data, or None if an error occurred.
    """
    try:
        # Step 1: Inspect raw data
        print("Inspecting the raw data from the file:")
        raw_df = pd.read_csv(file_path, header=None)  # No header assumed for inspection
        print(raw_df.head(10))  # Show the first 10 rows of raw data

        # Print the first line of the file to identify the delimiter and structure
        with open(file_path, 'r') as file:
            first_line = file.readline()
            print("\nFirst line of the file (header or data):")
            print(first_line)

        # Read the file with tab delimiter
        df = pd.read_csv(file_path, delimiter='\t')

        # Renaming columns to match expected structure
        df.columns = ['Sport', 'Date', 'Title', 'Time', 'Distance', 'Elevation', 'Heart Rate', 'Pace']

        # Step 4: Strip whitespace from column names
        df.columns = df.columns.str.strip()

        # Display the final DataFrame
        print("\nFinal DataFrame structure:")
        print(df.info())
        print(df.head())
        
        return df

    except FileNotFoundError:
        print(f"Error: File not found at {file_path}. Please check the path.")
        return None
    except pd.errors.ParserError as e:
        print(f"Error while parsing the file: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def calculate_pace(row):
    """
    Calculate the pace (in minutes per mile) for a given row.
    
    Args:
        row (pd.Series): A row from the DataFrame containing 'Time' and 'Distance'.
    
    Returns:
        float: Pace in minutes per mile (or kilometers, depending on the units used).
    """
    # Convert Time from hh:mm:ss or mm:ss format to total minutes
    time_str = row['Time']
    time_parts = time_str.split(':')
    
    if len(time_parts) == 2:  # mm:ss format
        minutes = int(time_parts[0])
        seconds = int(time_parts[1])
    elif len(time_parts) == 3:  # hh:mm:ss format
        hours = int(time_parts[0])
        minutes = int(time_parts[1])
        seconds = int(time_parts[2])
        minutes += hours * 60
    else:
        return None  # Invalid time format
    
    total_time_in_minutes = minutes + seconds / 60.0
    
    # Ensure Distance is numeric and convert to miles if it's in another unit
    distance = row['Distance']
    
    # Calculate pace: minutes per mile (or km)
    if distance > 0:
        pace = total_time_in_minutes / distance
        return pace
    else:
        return None  # Handle zero or invalid distance

def apply_pace_calculation(df):
    """
    Apply the pace calculation to the DataFrame.
    
    Args:
        df (pd.DataFrame): The DataFrame containing 'Time' and 'Distance'.
    
    Returns:
        pd.DataFrame: DataFrame with a new 'Pace' column.
    """
    # Apply the pace calculation to each row in the DataFrame
    df['Pace'] = df.apply(calculate_pace, axis=1)
    return df

def main():
    """
    Main function to handle file reading and processing.
    """
    # Call the helper method to read and parse the file
    df = read_and_parse_file(file_path)

    # Perform further operations if DataFrame is loaded successfully
    if df is not None:
        print("\nData successfully loaded and parsed. Ready for further processing.")
        
        # Apply pace calculation
        df = apply_pace_calculation(df)
        
        # Display DataFrame with the new 'Pace' column
        print("\nData with calculated pace:")
        print(df[['Time', 'Distance', 'Pace']])
    else:
        print("\nFailed to load and parse the data.")

# Run the main function
if __name__ == "__main__":
    main()
