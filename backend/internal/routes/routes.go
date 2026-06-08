package routes

import (
	"github.com/Sachin1373/payflow/backend/internal/app"
	"github.com/Sachin1373/payflow/backend/internal/auth"
	"github.com/Sachin1373/payflow/backend/internal/cashfree"
	"github.com/Sachin1373/payflow/backend/internal/invoices"
	"github.com/Sachin1373/payflow/backend/internal/middleware"
	"github.com/Sachin1373/payflow/backend/internal/profile"
	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	router := gin.Default()

	return router
}

func RegisterRoutes(router *gin.Engine, app *app.App) {

	authHandler := auth.NewModule(app)
	v1 := router.Group("/api/v1")

	auth := v1.Group("/auth")

	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	profileHandler := profile.NewModule(app)
	profile := v1.Group("/profile")
	profile.Use(middleware.Authorization(app.Config.JWTSecret))

	{
		profile.POST("/register", profileHandler.BusinessProfileRegister)
	}

	cashfreeHandler := cashfree.NewModule(app)
	webhooks := v1.Group("/webhooks")

	{
		webhooks.POST("/cashfree", cashfreeHandler.Webhook)
	}

	invoiceHandler := invoices.NewModule(app)
	invoice := v1.Group("/invoice")
	invoice.Use(middleware.Authorization(app.Config.JWTSecret))

	{
		invoice.POST("/create", invoiceHandler.CreateInvoice)
		invoice.GET("/get", invoiceHandler.GetInvoices)
	}
}
