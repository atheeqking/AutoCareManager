package com.autocare.repository;

import com.autocare.entity.Customer;
import com.autocare.entity.Vehicle;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class DomainPersistenceIntegrationTest {
 @Autowired private CustomerRepository customerRepository;
 @Autowired private VehicleRepository vehicleRepository;
 @Test void persistsAndFindsVehicleByBusinessIdentifiers() {
  Customer customer = customerRepository.saveAndFlush(new Customer("CUS-000001", "Demo Customer", "555-0100"));
  vehicleRepository.saveAndFlush(new Vehicle("VEH-000001", customer, "Toyota", "Camry", "Blue", "ABC-1234"));
  assertThat(vehicleRepository.findByVehicleId("VEH-000001")).isPresent();
  assertThat(vehicleRepository.findByLicensePlate("ABC-1234")).isPresent();
  assertThat(vehicleRepository.findByCustomer_CustomerId("CUS-000001")).hasSize(1);
 }
 @Test void enforcesUniqueCustomerBusinessId() {
  customerRepository.saveAndFlush(new Customer("CUS-000002", "First", "555-0101"));
  assertThatThrownBy(() -> customerRepository.saveAndFlush(new Customer("CUS-000002", "Second", "555-0102"))).isInstanceOf(DataIntegrityViolationException.class);
 }
}
