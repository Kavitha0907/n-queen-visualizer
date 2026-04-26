**N-Queens Visualizer**
**Overview**

This project is an interactive visualization of the N-Queens problem, built using Java backend and a simple frontend.

It demonstrates how backtracking algorithms work step-by-step.

**Features**

Visualizes queen placement and removal
Step-by-step backtracking animation
REST API to compute solutions
Supports dynamic board size (N)

**Tech Stack**

Java (HttpServer)
REST API
HTML, CSS, JavaScript

**How It Works**
User inputs value of N
Frontend calls:
/api/solve?n=4
Backend:

Solves using backtracking
Records steps (PLACE / REMOVE)
Returns JSON
Frontend animates the board
 
**Project Structure**

src/            → Java backend
public/         → Frontend files

**Run the Project**

javac src/NQueensServer.java
java -cp src NQueensServer

Then open:

http://localhost:8080
The output will be visible

**Concepts Used**

Backtracking
Recursion
REST APIs
State visualization
