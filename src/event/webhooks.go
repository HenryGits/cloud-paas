/**
 * @Time : 2019-06-28 11:50
 * @Author : solacowa@gmail.com
 * @File : webhooks
 * @Software: GoLand
 */

package event

import (
	"cloud-paas/src/repository"
	"cloud-paas/src/repository/types"
	"errors"
)

type Webhooks interface {
}

type Hook struct {
	AppName   string                `json:"app_name"`
	Namespace string                `json:"namespace"`
	Title     string                `json:"title"`
	Message   string                `json:"message"`
	EventDesc string                `json:"event_desc"`
	Event     repository.EventsKind `json:"event"`
	Member    *types.Member         `json:"member"`
	Project   *types.Project        `json:"project"`
}

//绑定数据
func BindWebhooks(hook *Hook) (err error) {

	return nil
}

func BindTestWebhooks(req *WebhooksRequest, webhooks *types.Webhook) (err error) {
	if webhooks.Status != 1 {
		err = errors.New("请先激活当前Webhooks")
		return
	}
	//go send(webhooks, req, req.Event)
	return
}
