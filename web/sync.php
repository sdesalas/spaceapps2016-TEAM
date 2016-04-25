<?php 

header('Access-Control-Allow-Origin: *');  

$sqlhost = "localhost";
$sqldb = "desalasw_teams";
$sqlusr = "desalasw_teams";
$sqlpwd = "lJX2pwpB0PDo";
$targetid = '';
$message = '{}';

/**
 * @return the value at $index in $array or $default if $index is not set.
 */
function idx(array $array, $key, $default = null) {
  return array_key_exists($key, $array) ? $array[$key] : $default;
}



// STEP 1: HANDLE INCOMING POST DATA
try {

	// Connect to database
	$pdoconn = new PDO('mysql:host=' . $sqlhost . ';dbname=' . $sqldb, $sqlusr, $sqlpwd, array( PDO::ATTR_PERSISTENT => false));

	if (isset($_POST['t']) && isset($_POST['message'])) {

		$targetid = $_POST["t"];
		$message = $_POST["message"];

		$statement = $pdoconn->prepare("INSERT INTO message (targetid, message) VALUES (:targetid, :message);");
		$statement->execute(array(
				":targetid" => $targetid,
				":message" => $message
			)
		);

	}

} catch (Exception $e) {
	// Problems connecting to database
  	header('HTTP/1.0 401 Unauthorized', true, 401);
	printf('{"status": 0, "message": "Error posting details into database."}');
  	exit();
}



// STEP 2: GET REQUEST DATA
try {

	$tid = $_GET["t"];
	$message = '{}';

	// Connect to database
	$pdoconn = new PDO('mysql:host=' . $sqlhost . ';dbname=' . $sqldb, $sqlusr, $sqlpwd, array( PDO::ATTR_PERSISTENT => false));

	$statement = $pdoconn->prepare("SELECT * FROM message WHERE targetid <> :targetid; DELETE FROM message WHERE timestamp < (NOW() - INTERVAL 5 SECOND)");
	$statement->execute(array(":targetid" => $targetid));
	foreach($statement->fetchAll() as $row) {
		$message = $row['message'];
	}

} catch (Exception $e) {
	// Problems connecting to database
  	header('HTTP/1.0 401 Unauthorized', true, 401);
	printf('{"status": 0, "message": "Error getting details from database."}');
  	exit();
}


// STEP 3: OUTPUT RESPONSE
printf('{"status": "1", "t": "' . $t . '", "message": ' . $message . '}');


?>