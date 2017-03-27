<?php
$title = file_get_contents("php://input");
file_put_contents("findTest.txt", "At start of file");

require_once('dbconnect.php');

// Use prepared statement to avoid sql injection attack
$selectSql = $conn->prepare("SELECT * FROM announce WHERE title = ?");

// "s" means the database expects a string
$selectSql->bind_param("s", $title);

if ($selectSql->execute()) {
	file_put_contents("findTest.txt", " inside if, stmt was executed ", FILE_APPEND);
}

// $result = $conn->query($selectSql); (NOPE!! This is for when it's not a prepared statement!)
$result = $selectSql->get_result(); 

$array = array();

if ($result->num_rows > 0) {
	file_put_contents("findTest.txt", " inside if, there is a result ", FILE_APPEND);
    // get each row and store in array
    while($row = $result->fetch_assoc()) {
    	file_put_contents("findTest.txt", " inside while loop ", FILE_APPEND);
        $array[] = $row;
    }
} else {
    echo "0 results";
}

file_put_contents("findTest.txt", "Array before json: ", FILE_APPEND);
file_put_contents("findTest.txt", $array, FILE_APPEND);
$array = json_encode($array);
file_put_contents("findTest.txt", " Array after json: ", FILE_APPEND);
file_put_contents("findTest.txt", $array, FILE_APPEND);
echo $array;

$conn->close();

?>