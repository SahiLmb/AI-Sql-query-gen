import sqlite3 

## Connectig to SQLite
connection = sqlite3.connect("multiinfo.db")

# Create a cursor object to insert records, create table

cursor= connection.cursor()

# Create the table
table_info="""
CREATE TABLE PropertyRecords (
    PropertyID INT PRIMARY KEY,
    OwnerName VARCHAR(100),
    Address VARCHAR(255),
    City VARCHAR(100),
    State VARCHAR(50),
    ZipCode VARCHAR(10),
    PropertyType VARCHAR(50),
    MarketValue DECIMAL(15, 2),
    LastSoldDate DATE
);
"""
cursor.execute(table_info)

## Insert Some more records
data = [
(1, 'Sahil Bodke', '123 Nehru Street', 'Mumbai', 'MH', '400021', 'Residential', 250000.00, '2022-06-15'),
(2, 'Darren Watkins', '456 Oak Bhawan', 'Pune', 'MH', '62702', 'Commercial', 500000.00, '2021-08-22'),
(3, 'Hardik Desai', '902 Tata road', 'Ujjain', 'MP', '60603', 'Residential', 300000.00, '2023-01-10'),
(4, 'Ramesh Singh', '101 Swift Lane', 'Bangalore', 'KN', '60540', 'Residential', 400000.00, '2020-12-05'),
(5, 'Reshma Advani', 'Tilak Road', 'Mumbai', 'MH', '62703', 'Industrial', 750000.00, '2019-07-19')
]
    
# Insert the data
cursor.executemany("INSERT INTO PropertyRecords VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", data)

# Create the HealthcareRecords table
table_info_healthcare = """
CREATE TABLE IF NOT EXISTS HealthcareRecords (
    RecordID INT PRIMARY KEY,
    PatientName VARCHAR(100),
    Age INT,
    Gender VARCHAR(10),
    Diagnosis VARCHAR(255),
    Treatment VARCHAR(255),
    DoctorName VARCHAR(100),
    VisitDate DATE
);
"""
cursor.execute(table_info_healthcare)

# Insert data into HealthcareRecords
data_healthcare = [
    (1, 'Amit Sharma', 45, 'Male', 'Hypertension', 'Medication', 'Dr. Mehta', '2023-03-01'),
    (2, 'Priya Singh', 34, 'Female', 'Diabetes', 'Diet and Exercise', 'Dr. Rao', '2023-05-12'),
    (3, 'Ravi Kumar', 28, 'Male', 'Asthma', 'Inhaler', 'Dr. Verma', '2022-11-23'),
    (4, 'Sneha Patel', 52, 'Female', 'Arthritis', 'Physical Therapy', 'Dr. Gupta', '2021-08-19'),
    (5, 'Manoj Joshi', 63, 'Male', 'Heart Disease', 'Surgery', 'Dr. Verma', '2020-02-14')
]
cursor.executemany("INSERT INTO HealthcareRecords VALUES (?, ?, ?, ?, ?, ?, ?, ?)", data_healthcare)

# Create the FinanceRecords table
table_info_finance = """
CREATE TABLE IF NOT EXISTS FinanceRecords (
    RecordID INT PRIMARY KEY,
    InvestorName VARCHAR(100),
    InvestmentType VARCHAR(50),
    AmountInvested DECIMAL(15, 2),
    ROI DECIMAL(5, 2),
    InvestmentDate DATE,
    MaturityDate DATE
);
"""
cursor.execute(table_info_finance)

# Insert data into FinanceRecords
data_finance = [
    (1, 'Anil Kapoor', 'Stocks', 100000.00, 12.5, '2020-01-01', '2023-01-01'),
    (2, 'Sunita Mehta', 'Bonds', 200000.00, 5.0, '2019-06-15', '2024-06-15'),
    (3, 'Rajesh Khanna', 'Mutual Funds', 150000.00, 8.75, '2021-03-10', '2026-03-10'),
    (4, 'Neha Singh', 'Real Estate', 500000.00, 15.0, '2018-11-20', '2023-11-20'),
    (5, 'Vikas Dubey', 'Gold', 300000.00, 6.0, '2017-08-05', '2022-08-05')
]
cursor.executemany("INSERT INTO FinanceRecords VALUES (?, ?, ?, ?, ?, ?, ?)", data_finance)

# Commit the changes and close the connection
connection.commit()
connection.close()