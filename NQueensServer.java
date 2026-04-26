import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class NQueensServer {

    public static void main(String[] args) throws IOException {
        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        
        server.createContext("/api/solve", new SolveHandler());
        server.createContext("/", new StaticFileHandler());
        
        server.setExecutor(null); 
        server.start();
        System.out.println("Server started at http://localhost:" + port);
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/")) {
                path = "/index.html";
            }
            
            Path file = Paths.get("public", path);
            if (Files.exists(file) && !Files.isDirectory(file)) {
                String contentType = "text/plain";
                if (path.endsWith(".html")) contentType = "text/html";
                else if (path.endsWith(".css")) contentType = "text/css";
                else if (path.endsWith(".js")) contentType = "application/javascript";
                
                byte[] bytes = Files.readAllBytes(file);
                exchange.getResponseHeaders().set("Content-Type", contentType);
                exchange.sendResponseHeaders(200, bytes.length);
                OutputStream os = exchange.getResponseBody();
                os.write(bytes);
                os.close();
            } else {
                String response = "404 Not Found";
                exchange.sendResponseHeaders(404, response.length());
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }
        }
    }

    static class SolveHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Parse query
            String query = exchange.getRequestURI().getQuery();
            int n = 4;
            if (query != null && query.contains("n=")) {
                try {
                    String[] parts = query.split("&");
                    for (String part : parts) {
                        if (part.startsWith("n=")) {
                            n = Integer.parseInt(part.substring(2));
                        }
                    }
                } catch (Exception e) {
                    // Ignore
                }
            }

            Result res = solveNQueens(n);
            String json = res.toJson();

            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, json.length());
            OutputStream os = exchange.getResponseBody();
            os.write(json.getBytes());
            os.close();
        }
    }

    // Logic
    static class Step {
        public String action;
        public int row;
        public int col;

        public Step(String action, int row, int col) {
            this.action = action;
            this.row = row;
            this.col = col;
        }

        public String toJson() {
            return "{\"action\":\"" + action + "\",\"row\":" + row + ",\"col\":" + col + "}";
        }
    }

    static class Result {
        public List<Step> steps;
        public List<List<String>> solutions;

        public Result(List<Step> steps, List<List<String>> solutions) {
            this.steps = steps;
            this.solutions = solutions;
        }

        public String toJson() {
            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"steps\":[");
            for (int i = 0; i < steps.size(); i++) {
                sb.append(steps.get(i).toJson());
                if (i < steps.size() - 1) sb.append(",");
            }
            sb.append("],\"solutions\":[");
            for (int i = 0; i < solutions.size(); i++) {
                sb.append("[");
                List<String> sol = solutions.get(i);
                for (int j = 0; j < sol.size(); j++) {
                    sb.append("\"").append(sol.get(j)).append("\"");
                    if (j < sol.size() - 1) sb.append(",");
                }
                sb.append("]");
                if (i < solutions.size() - 1) sb.append(",");
            }
            sb.append("]");
            sb.append("}");
            return sb.toString();
        }
    }

    public static Result solveNQueens(int n) {
        List<Step> steps = new ArrayList<>();
        List<List<String>> solutions = new ArrayList<>();
        char[][] board = new char[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                board[i][j] = '.';
            }
        }
        backtrack(board, 0, steps, solutions);
        return new Result(steps, solutions);
    }

    private static void backtrack(char[][] board, int col, List<Step> steps, List<List<String>> solutions) {
        if (col == board.length) {
            solutions.add(construct(board));
            return;
        }

        for (int row = 0; row < board.length; row++) {
            if (isSafe(board, row, col)) {
                board[row][col] = 'Q';
                steps.add(new Step("PLACE", row, col));

                backtrack(board, col + 1, steps, solutions);

                board[row][col] = '.';
                steps.add(new Step("REMOVE", row, col));
            }
        }
    }

    private static boolean isSafe(char[][] board, int row, int col) {
        int r, c;
        for (c = 0; c < col; c++) {
            if (board[row][c] == 'Q') return false;
        }
        for (r = row, c = col; r >= 0 && c >= 0; r--, c--) {
            if (board[r][c] == 'Q') return false;
        }
        for (r = row, c = col; r < board.length && c >= 0; r++, c--) {
            if (board[r][c] == 'Q') return false;
        }
        return true;
    }

    private static List<String> construct(char[][] board) {
        List<String> res = new ArrayList<>();
        for (int i = 0; i < board.length; i++) {
            res.add(new String(board[i]));
        }
        return res;
    }
}
