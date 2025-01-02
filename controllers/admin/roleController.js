import Role from '../../models/admin/roleModel.js'

import { deleteOne, getAll, getOne } from '../../factory/handleFactory.js'

import AppError from '../../utils/appError.js'
import catchAsync from '../../utils/catchAsync.js'
import { deleteKeysByPattern } from '../../services/redisService.js'

export const createRole = catchAsync(async (req, res, next) => {
    const { name, modules } = req.body

    const doc = await Role.create({ name, modules })

    if (!doc) {
        return next(new AppError(`Role could not be created`, 400))
    }

    await deleteKeysByPattern('Role')

    res.status(201).json({
        status: 'success',
        doc,
    })
})

export const getRoles = getAll(Role)

export const getRoleById = getOne(Role)

export const updateRole = catchAsync(async (req, res, next) => {
    const { name, modules } = req.body
    const roleId = req.params.id

    // Perform the update operation
    const doc = await Role.findByIdAndUpdate(
        roleId,
        { name, modules },
        {
            new: true,
            runValidators: true,
        }
    )

    // Handle case where the document was not found
    if (!doc) {
        return next(new AppError(`No role found with that ID`, 404))
    }

    await deleteKeysByPattern('Role')
    await deleteKeysByPattern('User')

    res.status(200).json({
        status: 'success',
        doc,
    })
})

export const deleteRole = deleteOne(Role)
