<?php
if (isset($_POST['module'])) {
    $module = $_POST['module'];
    include("modules/$module.php");
}
?>

<form method="post">
    <label for="module">Enter module name:</label>
    <input type="text" id="module" name="module">
    <input type="submit" value="Submit">
</form>
