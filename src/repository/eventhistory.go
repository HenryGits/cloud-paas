/**
 * @Time : 2019/8/5 5:36 PM
 * @Author : yuntinghu1003@gmail.com
 * @File : eventhistory
 * @Software: GoLand
 */

package repository

import (
	"cloud-paas/src/repository/types"
	"github.com/jinzhu/gorm"
)

type EventHistoryRepository interface {
	Create(history *types.EventHistory) error
}

type eventHistory struct {
	db *gorm.DB
}

func NewEventHistoryRepository(db *gorm.DB) EventHistoryRepository {
	return &eventHistory{db: db}
}

func (c *eventHistory) Create(history *types.EventHistory) error {
	return c.db.Create(history).Error
}
