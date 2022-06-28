import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.post("/upload", (req, res) => {
	try {
		if (!req.files) {
			res.send({
				uploaded: false,
				responseMessage: "Error. File was not uploaded",
			});
		} else {
			const uploadedImage = req.files.image;
			uploadedImage.mv("./img/" + uploadedImage.name);
			console.log(uploadedImage.name);

			res.send({
				uploaded: true,
				responseMessage: "Success. File was uploaded",
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

app.listen(PORT, () => {
	console.log(`[SERVER] listening on port ${PORT}`);
});
