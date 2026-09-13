<?php
include_once './db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Join with orders to get customer details
        $query = "SELECT i.*, o.customer_name, o.description 
                  FROM invoices i
                  JOIN orders o ON i.order_id = o.id
                  ORDER BY i.id DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($items);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->order_id) && isset($data->amount) && !empty($data->invoice_date)) {
            $query = "INSERT INTO invoices SET order_id=:order_id, invoice_date=:invoice_date, amount=:amount, status=:status";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":order_id", $data->order_id);
            $stmt->bindParam(":invoice_date", $data->invoice_date);
            $stmt->bindParam(":amount", $data->amount);
            $status = $data->status ?? 'unpaid';
            $stmt->bindParam(":status", $status);
            if($stmt->execute()) {
                echo json_encode(["message" => "Invoice generated successfully."]);
            } else {
                echo json_encode(["message" => "Unable to generate invoice."]);
            }
        } else {
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->id) && !empty($data->status)) {
            $query = "UPDATE invoices SET status=:status WHERE id=:id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":status", $data->status);
            $stmt->bindParam(":id", $data->id);
            if($stmt->execute()) {
                echo json_encode(["message" => "Invoice updated successfully."]);
            } else {
                echo json_encode(["message" => "Unable to update invoice."]);
            }
        } else {
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->id)) {
            $query = "DELETE FROM invoices WHERE id=:id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $data->id);
            if($stmt->execute()) {
                echo json_encode(["message" => "Invoice deleted successfully."]);
            } else {
                echo json_encode(["message" => "Unable to delete invoice."]);
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
