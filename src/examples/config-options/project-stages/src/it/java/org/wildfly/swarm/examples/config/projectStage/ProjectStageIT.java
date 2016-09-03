package org.wildfly.swarm.examples.config.projectStage;

import org.jboss.arquillian.drone.api.annotation.Drone;
import org.jboss.arquillian.junit.Arquillian;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.WebDriver;
import org.wildfly.swarm.it.AbstractIntegrationTest;
import org.wildfly.swarm.it.Log;

import static org.fest.assertions.Assertions.assertThat;

/**
 * @author Bob McWhirter
 */
@RunWith(Arquillian.class)
public class ProjectStageIT extends AbstractIntegrationTest {

    @Drone
    WebDriver browser;

    @Test
    public void testIt() throws Exception {
        Log log = getStdOutLog();

        assertThatLog( log ).hasLineContaining( "WFLYJCA0001: Bound data source [java:jboss/datasources/ExampleDS]" );


        browser.navigate().to("http://localhost:8080/");
        assertThat(browser.getPageSource()).contains("Howdy using connection: org.jboss.jca.adapters.jdbc.jdk7.WrappedConnectionJDK7" );
    }
}
