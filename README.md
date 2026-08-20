# BAAU HR Management System

BAAU HR Management System is a Human Resources Management System developed for managing and modernizing employee-related data and HR processes.

The project includes the migration and restructuring of data from the legacy Microsoft Access database into a modern relational database structure.

## Project Overview

The system is designed to manage core HR processes and employee information, including:

- Employee personal information
- Employment records
- Employment contracts
- Previous employment and work experience
- Departments and positions
- Education information
- Scientific degrees and titles
- Military information
- Family members
- Social statuses
- Leave management
- Orders
- Teaching workloads
- Employee work history

## Database Architecture

The database is organized into three main schemas:

### legacy

Contains data originating from the old database.

### stg

Staging area used during data migration, transformation, and validation.

### hr

Contains the cleaned and normalized HR database structure used by the new system.

The general migration flow is:

legacy → stg → hr

## Main HR Modules

The HR database is divided into several logical areas:

- Employee Management
- Employment Management
- Education
- Scientific Activity
- Work Experience
- Leave Management
- Orders
- Military Information
- Family Information
- Social Status
- Teaching Workload
- Reference and Lookup Data

## Data Migration

The project includes migration of historical HR data from the legacy Microsoft Access database.

During migration, legacy identifiers and source information are preserved where necessary so that migrated records can be traced back to their original source.

This allows:

- Data validation
- Migration auditing
- Error investigation
- Historical data traceability

## Database Design

The new database follows a normalized relational structure.

Instead of storing large amounts of employee information in a single table, related information is separated into dedicated tables and connected through foreign keys.

For example:

employees
   ↓
employment_records
   ├── employment_contracts
   └── employment_history

This approach improves:

- Data consistency
- Maintainability
- Scalability
- Historical tracking
- Reporting

## Technologies

- Microsoft SQL Server
- T-SQL
- Microsoft Access (Legacy Database)
- Git / GitHub

## Project Status

The project is currently under development.

Current work includes:

- Legacy database analysis
- Database schema design
- Data mapping
- Data migration
- Data validation
- HR business rule implementation

## Documentation

Detailed database documentation, table descriptions, mappings, and migration notes are maintained separately as part of the project documentation.

## Purpose

The main purpose of this project is to replace the legacy HR data structure with a cleaner, normalized, maintainable, and extensible HR database while preserving historical employee information and migration traceability.
