<?php
include_once './db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['from_date']) && isset($_GET['to_date'])) {
            $from_date = $_GET['from_date'];
            $to_date   = $_GET['to_date'];
            $query = "SELECT *, (quantity * price) AS total_cost 
                      FROM inventory 
                      WHERE purchased_date BETWEEN :from_date AND :to_date
                        AND purchased_date IS NOT NULL
                      ORDER BY purchased_date ASC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":from_date", $from_date);
            $stmt->bindParam(":to_date", $to_date);
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $total_items = count($items);
            $total_qty   = array_sum(array_column($items, 'quantity'));
            $total_cost  = array_sum(array_column($items, 'total_cost'));
            echo json_encode([
                "items"       => $items,
                "total_items" => $total_items,
                "total_qty"   => $total_qty,
                "total_cost"  => $total_cost
            ]);
        } else {
            $query = "SELECT * FROM inventory ORDER BY purchased_date DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($items);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->item_name) && isset($data->quantity) && !empty($data->status)) {
            $query = "INSERT INTO inventory SET item_name=:item_name, quantity=:quantity, unit=:unit, price=:price, status=:status, purchased_date=:purchased_date";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":item_name", $data->item_name);
            $stmt->bindParam(":quantity", $data->quantity);
            $unit = $data->unit ?? 'pcs';
            $stmt->bindParam(":unit", $unit);
            $price = !empty($data->price) ? $data->price : 0;
            $stmt->bindParam(":price", $price);
            $stmt->bindParam(":status", $data->status);
            $purchased_date = !empty($data->purchased_date) ? $data->purchased_date : null;
            $stmt->bindParam(":purchased_date", $purchased_date);
            if($stmt->execute()) {
                echo json_encode(["message" => "Item added successfully."]);
            } else {
                echo json_encode(["message" => "Unable to add item."]);
            }
        } else {
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->id)) {
            $query = "UPDATE inventory SET item_name=:item_name, quantity=:quantity, unit=:unit, price=:price, status=:status, purchased_date=:purchased_date WHERE id=:id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":item_name", $data->item_name);
            $stmt->bindParam(":quantity", $data->quantity);
            $stmt->bindParam(":unit", $data->unit);
            $price = !empty($data->price) ? $data->price : 0;
            $stmt->bindParam(":price", $price);
            $stmt->bindParam(":status", $data->status);
            $purchased_date = !empty($data->purchased_date) ? $data->purchased_date : null;
            $stmt->bindParam(":purchased_date", $purchased_date);
            $stmt->bindParam(":id", $data->id);
            if($stmt->execute()) {
                echo json_encode(["message" => "Item updated successfully."]);
            } else {
                echo json_encode(["message" => "Unable to update item."]);
            }
        } else {
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->id)) {
            $query = "DELETE FROM inventory WHERE id=:id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $data->id);
            if($stmt->execute()) {
                echo json_encode(["message" => "Item deleted successfully."]);
            } else {
                echo json_encode(["message" => "Unable to delete item."]);
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
