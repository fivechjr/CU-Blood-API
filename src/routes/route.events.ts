import { Router, Request, Response } from 'express'
import { param } from 'express-validator/check'
import { Event } from '../models/model.event'
import { apiResponse } from '../utils/util.response'
import { isValidated } from '../utils/util.validation'
import { isCached } from '../middlewares/md.is-cached';
import { PassportRequestEntity } from 'spec';

class Routes {
    private router: Router = Router()
    public bootstrap () : Router {
        this.router.get('/all', async (req: Request, res: Response) => {
            try {
                let options = {
                    attributes: ['id', 'title', 'updatedAt'],
                    order: [['id', 'DESC']]
                }
                let data = await Event.findAll(options)
                if (data.length > 0)
                    apiResponse(res, 200, data)
                else
                    apiResponse(res, 404)
            } catch (e) {
                apiResponse(res, 500)
            }
        })

        this.router.get('/all/:pageIndex', [
            param('pageIndex').isInt(),
            isValidated,
            isCached
        ], async (req: PassportRequestEntity, res: Response) => {
            let page = req.params.pageIndex - 1
            let limit = 10
            let offset = page * limit
            try {
                let options = {
                    attributes: ['id', 'title', 'location', 'displayImage', 'startDate', 'endDate'],
                    limit: limit,
                    offset: offset,
                    order: [['id', 'DESC']]
                }
                let data = await Event.findAndCountAll(options)
                if (data.rows.length > 0) {
                    let ret = {
                        currentPage: page + 1,
                        pageCount: Math.ceil(data.count / limit),
                        data: data.rows
                    }
                    apiResponse(res, 200, ret, null, false, req.cacheKey)
                } else {
                    apiResponse(res, 404)
                }
            } catch (e) {
                apiResponse(res, 500)
            }
        })

        this.router.get('/:eventId', [
            param('eventId').isInt(),
            isValidated,
            isCached
        ], async (req, res) => {
            try {
                let data = await Event.findById(req.params.eventId)
                if (data != null)
                    apiResponse(res, 200, data, null, false, req.cacheKey)
                else
                    apiResponse(res, 404)
            } catch (e) {
                apiResponse(res, 500)
            }
        })
        
        return this.router
    }
}

export default (new Routes()).bootstrap()