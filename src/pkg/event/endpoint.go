/**
 * @Time : 2019-07-22 14:24
 * @Author : solacowa@gmail.com
 * @File : endpoint
 * @Software: GoLand
 */

package event

import (
	"cloud-paas/src/util/encode"
	"context"
	"github.com/go-kit/kit/endpoint"
)

func makeAllEndpoint(s Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		res, err := s.All(ctx)
		return encode.Response{Err: err, Data: res}, err
	}
}
