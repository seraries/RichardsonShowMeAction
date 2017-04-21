<?php 

$email = file_get_contents("php://input");
require_once('dbconnect.php');

// Use prepared statement to avoid sql injection attack
$selectSql = $conn->prepare("SELECT billsFollowed FROM activists WHERE email = ?");

// "s" means the database expects a string
$selectSql->bind_param("s", $email);

if ($selectSql->execute()) {
    //file_put_contents("findTest.txt", " inside if, stmt was executed ", FILE_APPEND);
}

// $result = $conn->query($selectSql); (NOPE!! This is for when it's not a prepared statement!)
$result = $selectSql->get_result(); 

$array = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $array[] = $row;
    }
} else {
    echo "0 results";
}
$array = json_encode($array);
//file_put_contents("findTest.txt", " Array after json: ", FILE_APPEND);
//file_put_contents("findTest.txt", $array, FILE_APPEND);
echo $array;

$conn->close();

?>