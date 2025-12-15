import dotenv from 'dotenv'



cosole.log(process.env.DATABSE_URL)

async function createUsersTable() {
    try {
	await client.connect();
	// create the table here
    } catch (error) {
    	console.log("Error occured when trying to create database tables");
    }
    
};
