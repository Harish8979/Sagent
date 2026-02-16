package com.grocery.groceryapp.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int addressId;

    private String houseNo;
    private String street;
    private String area;
    private String city;
    private String state;
    private String pincode;
    private String addressType;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Address() {}

    public int getAddressId() { return addressId; }
    public void setAddressId(int addressId) { this.addressId = addressId; }

    public String getHouseNo() { return houseNo; }
    public void setHouseNo(String houseNo) { this.houseNo = houseNo; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getAddressType() { return addressType; }
    public void setAddressType(String addressType) { this.addressType = addressType; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
