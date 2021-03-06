const {
  getCouponModel,
  getCouponByIdModel,
  postCouponByIdModel,
  deleteCouponByIdModel,
  patchCouponByIdModel
} = require('../model/coupon')
const redis = require('redis')
const client = redis.createClient()
const helper = require('../helper/response')
const fs = require('fs')
module.exports = {
  getCoupon: async (request, response) => {
    try {
      const result = await getCouponModel()
      client.setex('getcupon', 3600, JSON.stringify(result))
      return helper.response(response, 200, 'Success Get Product', result)
    } catch (error) {
      return helper.response(response, 400, 'Bad Request', error)
    }
  },
  getCouponById: async (request, response) => {
    try {
      const { id } = request.params
      const result = await getCouponByIdModel(id)
      if (result.length > 0) {
        client.setex(`getcuponbyid:${id}`, 3600, JSON.stringify(result))
        return helper.response(response, 200, 'Success Get Product', result)
      } else {
        return helper.response(
          response,
          200,
          `failed ,id ${id} Not Found Product`,
          result
        )
      }
    } catch (error) {
      console.log(error)
      return helper.response(response, 400, 'Bad Request', error)
    }
  },
  postCoupon: async (request, response) => {
    const {
      coupon_name,
      coupon_code,
      coupon_discon,
      cupon_min,
      cupon_max,
      coupon_start,
      coupon_end,
      coupon_information,
      coupon_status
    } = request.body

    const data = {
      coupon_name,
      coupon_code,
      coupon_discon,
      cupon_min,
      cupon_max,
      coupon_start,
      coupon_end,
      coupon_information,
      coupon_created_at: new Date(),
      coupon_updated_at: new Date(),
      coupon_status,
      coupon_img: request.file === undefined ? '' : request.file.filename
    }

    try {
      const result = await postCouponByIdModel(data)
      helper.response(response, 200, 'coupon inserted succesfully', result)
    } catch (error) {
      helper.response(response, 400, 'coupon not inserted', error)
    }
  },
  deleteCoupon: async (request, response) => {
    try {
      const { id } = request.params
      const result = await getCouponByIdModel(id)
      if (result.length > 0) {
        const deleteResult = await deleteCouponByIdModel(id)
        if (result.coupon_img !== '') {
          fs.unlink(`./upload/coupon/${result[0].coupon_img}`, function (err) {
            if (err) {
              console.log('no image on directory')
            }
            console.log('File deleted!')
          })
        }
        return helper.response(
          response,
          200,
          'Success Delete Product',
          deleteResult
        )
      } else {
        return helper.response(
          response,
          200,
          `failed ,id ${id} Not Found Product`,
          result
        )
      }
    } catch (error) {
      console.log(error)
      return helper.response(response, 400, 'Bad Request', error)
    }
  },
  patchCoupon: async (request, response) => {
    const {
      coupon_name,
      coupon_code,
      coupon_discon,
      cupon_min,
      cupon_max,
      coupon_start,
      coupon_end,
      coupon_information,
      coupon_status
    } = request.body

    const data = {
      coupon_name,
      coupon_code,
      coupon_discon,
      cupon_min,
      cupon_max,
      coupon_start,
      coupon_end,
      coupon_information,
      coupon_updated_at: new Date(),
      coupon_status,
      coupon_img: request.file === undefined ? '' : request.file.filename
    }

    const { id } = request.params

    try {
      const cekCoupon = await getCouponByIdModel(id)
      if (cekCoupon.length > 0) {
        //console.log(cekCoupon[0].coupon_img)
        if (data.coupon_img) {
          if (cekCoupon[0].coupon_img !== data.coupon_img) {
            fs.unlink(
              `./upload/coupon/${cekCoupon[0].coupon_img}`,
              function (err) {
                if (err) {
                  console.log('image')
                }
                console.log('Image Update Old File deleted!')
              }
            )
          }
          // console.log(cekCoupon[0].coupon_img)
          // console.log(cekCoupon.length)
        } else {
          delete data.coupon_img
          console.log('Update without img!')
        }

        const result = await patchCouponByIdModel(data, id)
        helper.response(response, 200, 'coupon updated succesfully', result)
      } else {
        helper.response(response, 400, 'coupon not found succesfully')
      }
    } catch (error) {
      console.log(error)
      helper.response(response, 400, 'coupon not updated', error)
    }
  }
}
