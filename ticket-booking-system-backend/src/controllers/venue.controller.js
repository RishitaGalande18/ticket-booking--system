const {
    createVenue,
    getVenueLayout
} = require("../services/venue.service");

const {
    createVenueSchema
} = require("../validators/venue.validator");


const createVenueController = async (
    req,
    res
) => {
    const validateData =  createVenueSchema.parse(req.body);

    try {
        const adminId = req.user.id;
        const venue = await createVenue(validateData, adminId);
        res.status(201).json({
    success: true,
    venue
});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getVenueLayoutController = async (req, res) => {
    try {
        const { venueId } = req.params;
        const layout = await getVenueLayout(venueId);

        return res.status(200).json(layout);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createVenueController,
    getVenueLayoutController
};