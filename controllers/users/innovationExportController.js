import InnovationExport from './../../models/users/innovationExportModel.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from '../../factory/handleFactory.js'

export const createInnovationExport = createOne(InnovationExport)
// export const createInnovationExport = async (req, res) => {
//     try {
//         const {
//             name,
//             role,
//             organization,
//             email,
//             phoneNumber,
//             suggestions,
//             sections,
//         } = req.body

//         console.log({ body: req.body })

//         // Create a new instance of InnovationExport with the provided data
//         const newInnovationExport = new InnovationExport({
//             name,
//             role,
//             organization,
//             email,
//             phoneNumber,
//             suggestions,
//             sections,
//         })

//         console.log({ newInnovationExport })

//         // Save the new record to the database
//         const savedRecord = await newInnovationExport.save()

//         // Send back the saved record as a response
//         return res.status(201).json({
//             success: true,
//             message: 'Innovation Export data saved successfully.',
//             data: savedRecord,
//         })
//     } catch (error) {
//         console.error(error)
//         return res.status(400).json({
//             success: false,
//             message: 'Failed to save Innovation Export data.',
//             error: error.message,
//         })
//     }
// }

export const getInnovationExports = getAll(InnovationExport)

export const getInnovationExportById = getOne(InnovationExport)

export const deleteInnovationExport = deleteOne(InnovationExport)

export const updateInnovationExport = updateOne(InnovationExport)
