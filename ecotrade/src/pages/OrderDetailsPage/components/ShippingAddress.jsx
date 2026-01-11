import React from "react";
import { MapPin, User, Phone } from "lucide-react";

const ShippingAddress = ({ address }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Shipping Address
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-2">
          <div className="flex items-start">
            <User className="h-4 w-4 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{address.fullName}</p>
              <p className="text-sm text-gray-600">{address.address}</p>
              <p className="text-sm text-gray-600">
                {address.city}, {address.state} {address.zipCode}
              </p>
              <p className="text-sm text-gray-600">{address.country}</p>
            </div>
          </div>
          {address.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-3" />
              <p className="text-sm text-gray-600">{address.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingAddress;