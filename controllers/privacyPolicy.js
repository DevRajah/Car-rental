const privacyPolicy = require('../utils/privacypolicy');

const privacy = async (req, res) => {
    try {
        // The privacyPolicy HTML content 
        const privacyHTML = privacyPolicy();

        if (!privacyHTML) {
            return res.status(404).send("Privacy Policy is not available");
        }

        return res.status(200).send(privacyHTML);

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error " + error.message,
        })
    }
}


module.exports = privacy;