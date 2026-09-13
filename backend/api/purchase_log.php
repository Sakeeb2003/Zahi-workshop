<?php
include_once './db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Summary with date range
        if (isset($_GET['from_date']) && isset($_GET['to_date'])) {
            $from_date = $_GET['from_date'];
            $to_date   = $_GET['to_date'];
            $query = "SELECT * FROM purchase_log 
                      WHERE purchased_date BETWEEN :from_date AND :to_date 
                      ORDER BY purchased_date ASC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':from_date', $from_date);
            $stmt->bindParam(':to_date', $to_date);
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $total_items = count($items);
            $total_qty   = array_sum(array_column($items, 'quantity'));
            $total_cost  = array_sum(array_column($items, 'total_cost'));
            echo json_encode([
                'items'       => $items,
                'total_items' => $total_items,
                'total_qty'   => $total_qty,
                'total_cost'  => $total_cost
            ]);
        } else {
            // Return all logs
            $query = "SELECT * FROM purchase_log ORDER BY purchased_date DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'));
        if (!empty($data->item_name) && isset($data->quantity) && !empty($data->purchased_date)) {
            $price     = !empty($data->price_per_unit) ? $data->price_per_unit : 0;
            $total     = $data->quantity * $price;
            $unit      = $data->unit ?? 'pcs';
            $notes     = $data->notes ?? '';
            $query = "INSERT INTO purchase_log 
                      SET item_name=:item_name, quantity=:quantity, unit=:unit, 
                          price_per_unit=:price, total_cost=:total, 
                          purchased_date=:purchased_date, notes=:notes";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':item_name',      $data->item_name);
            $stmt->bindParam(':quantity',        $data->quantity);
            $stmt->bindParam(':unit',            $unit);
            $stmt->bindParam(':price',           $price);
            $stmt->bindParam(':total',           $total);
            $stmt->bindParam(':purchased_date',  $data->purchased_date);
            $stmt->bindParam(':notes',           $notes);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Purchase logged successfully.', 'id' => $db->lastInsertId()]);
            } else {
                echo json_encode(['message' => 'Unable to log purchase.']);
            }
        } else {
            echo json_encode(['message' => 'Incomplete data.']);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'));
        if (!empty($data->id)) {
            $query = "DELETE FROM purchase_log WHERE id=:id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            if ($stmt->execute()) {
                echo json_encode(['message' => 'Log deleted successfully.']);
            } else {
                echo json_encode(['message' => 'Unable to delete log.']);
            }
        } else {
            echo json_encode(['message' => 'Incomplete data.']);
        }
        break;

    default:
        echo json_encode(['message' => 'Method not allowed']);
        break;
}
?>
