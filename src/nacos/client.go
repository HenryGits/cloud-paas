package nacos

import (
	"github.com/icowan/config"
	"github.com/nacos-group/nacos-sdk-go/clients"
	"github.com/nacos-group/nacos-sdk-go/clients/config_client"
	"github.com/nacos-group/nacos-sdk-go/common/constant"
	"github.com/nacos-group/nacos-sdk-go/vo"
)

type NacosClient interface {
	Do() *config_client.IConfigClient
}

type client struct {
	client config_client.IConfigClient
}

func (c client) Do() *config_client.IConfigClient {
	panic("implement me")
}

func NewNacosClient(cf *config.Config) (iClient NacosClient, err error) {
	//create clientConfig
	clientConfig := constant.ClientConfig{
		NamespaceId:         "e525eafa-f7d7-4029-83d9-008937f9d468", //we can create multiple clients with different namespaceId to support multiple namespace.When namespace is public, fill in the blank string here.
		TimeoutMs:           5000,
		NotLoadCacheAtStart: true,
		LogDir:              "/tmp/nacos/log",
		CacheDir:            "/tmp/nacos/cache",
		RotateTime:          "1h",
		MaxAge:              3,
		LogLevel:            "debug",
	}

	// At least one ServerConfig
	serverConfigs := []constant.ServerConfig{
		{
			IpAddr:      "localhost",
			ContextPath: "/nacos",
			Port:        8848,
			Scheme:      "http",
		},
		//{
		//	IpAddr:      "console2.nacos.io",
		//	ContextPath: "/nacos",
		//	Port:        80,
		//	Scheme:      "http",
		//},
	}

	// Another way of create config client for dynamic configuration (recommend)
	configClient, err := clients.NewConfigClient(
		vo.NacosClientParam{
			ClientConfig:  &clientConfig,
			ServerConfigs: serverConfigs,
		},
	)
	return &client{client: configClient}, err
}
