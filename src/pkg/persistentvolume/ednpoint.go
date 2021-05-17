/**
 * @Time : 2019-07-17 18:58
 * @Author : solacowa@gmail.com
 * @File : ednpoint
 * @Software: GoLand
 */

package persistentvolume

import (
	"cloud-paas/src/util/encode"
	"context"
	"github.com/go-kit/kit/endpoint"
)

type getPvRequest struct {
	Name string
}

func makeGetEndpoint(s Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		req := request.(getPvRequest)
		res, err := s.Get(ctx, req.Name)
		return encode.Response{Data: res, Err: err}, err
	}
}
