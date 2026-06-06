package models

type RegisterRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	MobileNo  string `json:"mobile_no"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

type Login struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Business struct {
	Uuid      string
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	MobileNo  string `json:"mobile_no"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}
