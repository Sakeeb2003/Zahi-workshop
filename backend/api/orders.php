<?php
include_once './db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['summary']) && $_GET['summary'] == 'true') {
            // Date range summary
            $from_date = isset($_GET['from_date']) ? $_GET['from_date'] : date('Y-m-01');
            $to_date = isset($_GET['to_date']) ? $_GET['to_date'] : date('Y-m-t');
            
            $query = "SELECT 
                        COUNT(*) as total_orders, 
                        SUM(CASE WHEN status = 'finished' THEN 1 ELSE 0 END) as finished_orders,
                        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                        SUM(total_amount) as total_revenue
                      FROM orders 
                      WHERE order_date BETWEEN :from_date AND :to_date";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':from_date', $from_date);
            $stmt->bindParam(':to_date', $to_date);
            $stmt->execute();
            $summary = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Also get some inventory stats for the dashboard
            $invQuery = "SELECT 
                            COUNT(*) as total_items,
                            SUM(CASE WHEN status = 'needs_purchase' THEN 1 ELSE 0 END) as items_to_buy
                         FROM inventory";
            $invStmt = $db->prepare($invQuery);
            $invStmt->execute();
            $invSummary = $invStmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode(["orders" => $summary, "inventory" => $invSummary]);
            
        } else {
            // Get all orders
            $query = "SELECT * FROM orders ORDER BY id DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($items);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->customer_name) && isset($data->total_amount) && !empty($data->order_date)) {
            $query = "INSERT INTO orders SET customer_name=:customer_name, description=:description, total_amount=:total_amount, status=:status, order_date=:order_date";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":customer_name", $data->customer_name);
            $description = $data->description ?? '';
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":total_amount", $data->total_amount);
            $status = $data->status ?? 'pending';
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":order_date", $data->order_date);
            if($stmt->execute()) {
                echo json_encode(["message" => "Order added successfully."]);
            } else {
                echo json_encode(["message" => "Unable to add order."]);
            }
        } else {
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->id)) {
            $query = "UPDATE orders SET customer_name=:customer_name, description=:description, total_amount=:total_amount, status=:status, order_date=:order_date WHERE id=:id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":customer_name", $data->customer_name);
            $stmt->bindParam(":description", $data->description);
            $stmt->bindParam(":total_amount", $data->total_amount);
            $stmt->bindParam(":status", $data->status);
            $stmt->bindParam(":order_date", $data->order_date);
            $stmt->bindParam(":id", $data->id);
            if($stmt->execute()) {
                echo json_encode(["message" => "Order updated successfully."]);
            } else {
                echo json_encode(["message" => "Unable to update order."]);
            }
        } else {
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->id)) {
            $query = "DELETE FROM orders WHERE id=:id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $data->id);
            if($stmt->execute()) {
                echo json_encode(["message" => "Order deleted successfully."]);
            } else {
                echo json_encode(["message" => "Unable to delete order."]);
            }
        } else {
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;
        
    default:
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
?>
