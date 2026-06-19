package routes

import (
	"github.com/Sachin1373/payflow/backend/internal/app"
	"github.com/Sachin1373/payflow/backend/internal/auth"
	"github.com/Sachin1373/payflow/backend/internal/cashfree"
	"github.com/Sachin1373/payflow/backend/internal/customers"
	"github.com/Sachin1373/payflow/backend/internal/dashboard"
	"github.com/Sachin1373/payflow/backend/internal/invoices"
	"github.com/Sachin1373/payflow/backend/internal/middleware"
	"github.com/Sachin1373/payflow/backend/internal/orders"
	"github.com/Sachin1373/payflow/backend/internal/profile"
	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {

		// sqlDB, err := app.App.
		// if err != nil {
		// 	c.JSON(503, gin.H{
		// 		"status": "unhealthy",
		// 	})
		// 	return
		// }

		// if err := sqlDB.Ping(); err != nil {
		// 	c.JSON(503, gin.H{
		// 		"status": "unhealthy",
		// 	})
		// 	return
		// }

		c.JSON(200, gin.H{
			"status": "healthy",
		})
	})

	return router
}

func RegisterRoutes(router *gin.Engine, app *app.App) {

	authHandler := auth.NewModule(app)
	v1 := router.Group("/api/v1")

	auth := v1.Group("/auth")

	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.Refresh)
		auth.POST("/logout", authHandler.Logout)
	}

	authProtected := v1.Group("/auth")
	authProtected.Use(middleware.Authorization(app.Config.JWTSecret))
	{
		authProtected.GET("/me", authHandler.GetProfile)
	}

	profileHandler := profile.NewModule(app)
	profile := v1.Group("/profile")
	profile.Use(middleware.Authorization(app.Config.JWTSecret))

	{
		profile.GET("", profileHandler.GetBusinessProfile)
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
		invoice.GET("/:id", invoiceHandler.GetInvoice)
		invoice.POST("/send/:id", invoiceHandler.SendInvoice)
	}

	customerHandler := customers.NewModule(app)
	customer := v1.Group("/customer")
	customer.Use(middleware.Authorization(app.Config.JWTSecret))

	{
		customer.GET("/list", customerHandler.ListCustomers)
		customer.POST("/create", customerHandler.CreateCustomer)
		customer.GET("/search", customerHandler.SearchCustomers)
	}

	orderHandler := orders.NewModule(app)
	order := v1.Group("/order")
	order.Use(middleware.Authorization(app.Config.JWTSecret))

	{
		order.GET("/list", orderHandler.GetOrders)
		order.GET("/:id", orderHandler.GetOrder)
	}

	dashboardHandler := dashboard.NewModule(app)
	dash := v1.Group("/dashboard")
	dash.Use(middleware.Authorization(app.Config.JWTSecret))

	{
		dash.GET("/stats", dashboardHandler.GetStats)
	}
}
