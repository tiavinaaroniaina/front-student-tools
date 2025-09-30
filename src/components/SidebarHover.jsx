@@ .. @@
 import React from "react";
 import "../styles/sidebar.css";
 import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
 import { 
   faHome, 
   faSnowflake, 
   faCheckSquare, 
-  faCaretDown, 
   faCalendar, 
-  faUser, 
-  faShieldAlt 
+  faBars,
+  faTimes
 } from "@fortawesome/free-solid-svg-icons";
+import { useLocation } from "react-router-dom";
 
 const SidebarHover = ({ userKind, sidebarVisible, setSidebarVisible }) => {
+  const location = useLocation();
+  
+  const navigationItems = [
+    {
+      path: "/app/certificate",
+      icon: faHome,
+      label: "Certificat Scolarité",
+      tooltip: "Générer un certificat de scolarité"
+    },
+    {
+      path: "/app/freeze-begin",
+      icon: faSnowflake,
+      label: "Freeze",
+      tooltip: "Consulter les jours de freeze"
+    },
+    {
+      path: "/app/check",
+      icon: faCheckSquare,
+      label: "Checking",
+      tooltip: "Statistiques de présence"
+    },
+    {
+      path: "/app/calendar",
+      icon: faCalendar,
+      label: "Calendar",
+      tooltip: "Calendrier étudiant"
+    }
+  ];
+  
+  const isActivePath = (path) => {
+    return location.pathname === path;
+  };
+  
+  const handleOverlayClick = () => {
+    setSidebarVisible(false);
+  };
+
   return (
     <>
-      {/* Button toggle mobile */}
+      {/* Mobile Toggle Button */}
       <button 
         className="sidebar-toggle-btn" 
         onClick={() => setSidebarVisible(!sidebarVisible)}
+        aria-label={sidebarVisible ? "Fermer le menu" : "Ouvrir le menu"}
       >
-        ☰
+        <FontAwesomeIcon icon={sidebarVisible ? faTimes : faBars} />
       </button>
 
+      {/* Mobile Overlay */}
+      <div 
+        className={`sidebar-overlay ${sidebarVisible ? "visible" : ""}`}
+        onClick={handleOverlayClick}
+        aria-hidden="true"
+      />
+
+      {/* Sidebar */}
       <aside className={`sidebar ${sidebarVisible ? "visible" : ""}`}>
+        {/* Logo Section */}
         <div className="sidebar-logo">
           <img src="/images/logo.png" alt="Logo" />
         </div>
 
+        {/* Navigation */}
         <ul>
-          <li>
-            <a href="/app/certificate">
-              <FontAwesomeIcon icon={faHome} />
-              <span>Certificat Scolarite</span>
-            </a>
-          </li>
-          <li>
-            <a href="/app/freeze-begin">
-              <FontAwesomeIcon icon={faSnowflake} />
-              <span>Freeze</span>
-            </a>
-          </li>
-          <li className="has-submenu">
-            <a href="/app/check">
-              <FontAwesomeIcon icon={faCheckSquare} />
-              <span>Checking</span>
-            </a>
-          </li>
-            <li className="has-submenu">
-            <a href="/app/calendar">
-              <FontAwesomeIcon icon={faCalendar} />
-              <span>Calendar</span>
-            </a>
-          </li>
+          {navigationItems.map((item) => (
+            <li key={item.path}>
+              <a 
+                href={item.path}
+                className={isActivePath(item.path) ? "active" : ""}
+                onClick={() => {
+                  // Close sidebar on mobile after navigation
+                  if (window.innerWidth < 768) {
+                    setSidebarVisible(false);
+                  }
+                }}
+              >
+                <div className="nav-icon">
+                  <FontAwesomeIcon icon={item.icon} />
+                </div>
+                <span className="nav-text">{item.label}</span>
+                <div className="nav-tooltip">
+                  {item.tooltip}
+                </div>
+              </a>
+            </li>
+          ))}
         </ul>
+        
+        {/* Footer */}
+        <div className="sidebar-footer">
+          <div className="nav-text">
+            <small>© 2025 42 Dashboard</small>
+          </div>
+        </div>
       </aside>
     </>
   );
 };
 
 export default SidebarHover;