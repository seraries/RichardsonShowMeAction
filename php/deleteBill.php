<?php
$bill = file_get_contents("php://input");

require_once('dbconnect.php');

// Use prepared statement to avoid sql injection attack
$deleteSql = $conn->prepare("DELETE FROM bills WHERE billNum = ?");

// "s" means the database expects a string
$deleteSql->bind_param("s", $bill);

if ($deleteSql->execute() === TRUE) {
} else {
    // echo "Error: " . $sql . "<br>" . $conn->error;
}

$deleteSql->close();

$sql = "SELECT billNum, billLink, branch, position, why, contactTitle, contactLink FROM bills";

$result = $conn->query($sql);

$array = array();

if ($result->num_rows > 0) {
    // get each row and store in array
    while($row = $result->fetch_assoc()) {
        $array[] = $row;
    }
} else {
    echo "0 results";
}

$array = json_encode($array);

echo $array;

$conn->close();

?>