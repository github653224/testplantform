import request from '@/utils/request'

export function getapicasesList(params) {
  return request({
    url: '/apicases',
    method: 'get',
    params
  })
}

export function getcasenum(params) {
  return request({
    url: '/apicases/getcasenum',
    method: 'get',
    params
  })
}

export function search(apicasesForm) {
  return request({
    url: '/apicases/search',
    method: 'post',
    data: apicasesForm
  })
}

export function findcasesbyname(apicasesForm) {
  return request({
    url: '/apicases/searchbyname',
    method: 'post',
    data: apicasesForm
  })
}

export function addapicases(apicasesForm) {
  return request({
    url: '/apicases',
    method: 'post',
    data: apicasesForm
  })
}

export function updateapicases(apicasesForm) {
  return request({
    url: '/apicases/detail',
    method: 'put',
    data: apicasesForm
  })
}

export function removeapicases(apicasesId) {
  return request({
    url: '/apicases/' + apicasesId,
    method: 'delete'
  })
}
